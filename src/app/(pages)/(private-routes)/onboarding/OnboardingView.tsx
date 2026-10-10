"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircleIcon } from "@phosphor-icons/react";
import TopNavigation from "@/shared/components/composites/layout/top-navigation/TopNavigation";
import { useSubscriptionEntitlement } from "@/services/domains/subscriptions/hooks/useSubscriptionEntitlement";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useQueryAuthMe } from "@/services/domains/auth/hooks/useQueryAuthMe";
import { useQueryServiceTypes } from "@/services/domains/service-type/hooks/useQueryServiceTypes";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import salonService from "@/services/domains/salons/salon.service";
import { useOnboardingDraftStore } from "@/services/domains/salons/store/useOnboardingDraftStore";
import {
  IOnboardingBranch,
  IOnboardingService,
  IOnboardingStaff,
} from "@/services/domains/salons/types/onboarding.type";
import {
  getApiErrorFieldData,
  getApiErrorMessage,
  getApiFieldErrorMessage,
} from "@/services/domains/booking/utils/booking-mappers";
import { isValidServiceDuration } from "@/shared/utils/serviceDuration";
import { RouteAddress } from "@/shared/data/routeAddress";
import { cn } from "@/shared/utils/className";
import { APP_LOCALE } from "@/shared/utils/locale";
import { SalonApprovalStatus, SalonRoleName } from "@/services/common/enums/domain-enums";
import { getLoginHref } from "@/shared/utils/authRedirect";
import {
  StepBranches,
  StepPhotosSubmit,
  StepSalon,
  StepServices,
  StepTeam,
  isBranchComplete,
  newBranch,
} from "./components/steps";

/** Five steps (was seven): media + submit and staff + schedule are now one step each. */
const STEPS = [
  { id: 1, label: "سالن" },
  { id: 2, label: "شعبه" },
  { id: 3, label: "خدمات" },
  { id: 4, label: "تیم و ساعت کاری" },
  { id: 5, label: "عکس‌ها و ارسال" },
];

function offeringIdsFromServices(services: IOnboardingService[]): string[] {
  return services
    .map((s) => s.publicId)
    .filter((id): id is string => Boolean(id))
    .map(String);
}

/** Drop staff offering ids that are no longer in the saved services list. */
function pruneStaffOfferings(staff: IOnboardingStaff[], services: IOnboardingService[]): IOnboardingStaff[] {
  const valid = new Set(offeringIdsFromServices(services));
  return staff.map((s) => ({
    ...s,
    offeringPublicIds: (s.offeringPublicIds ?? []).map(String).filter((id) => valid.has(id)),
  }));
}

/** Remap staff branchPublicId when save-branches replaces temp/local IDs with server Guids. */
function remapStaffBranchIds(
  staff: IOnboardingStaff[],
  previous: IOnboardingBranch[],
  saved: IOnboardingBranch[]
): IOnboardingStaff[] {
  const remap = new Map<string, string>();
  previous.forEach((old, i) => {
    const nextId = saved[i]?.publicId;
    if (nextId && old.publicId && old.publicId !== nextId) remap.set(String(old.publicId), String(nextId));
  });
  if (remap.size === 0) return staff;
  return staff.map((s) => ({ ...s, branchPublicId: remap.get(s.branchPublicId) ?? s.branchPublicId }));
}

/** «گام 2 از 5 · شعبه» + five segments; a segment jumps there once the salon exists. */
function Progress({ step, canJump, onJump }: { step: number; canJump: boolean; onJump: (n: number) => void }) {
  const label = STEPS.find((s) => s.id === step)?.label ?? "";
  return (
    <div className="flex flex-col gap-2 px-safe-area pb-4 pt-2">
      <div className="flex gap-1.5">
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-label={`گام ${s.id.toLocaleString(APP_LOCALE)}: ${s.label}`}
            aria-current={s.id === step ? "step" : undefined}
            disabled={!(s.id < step || canJump)}
            onClick={() => onJump(s.id)}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              s.id < step ? "bg-primary" : s.id === step ? "bg-primary/60" : "bg-border"
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground">
          گام {step.toLocaleString(APP_LOCALE)} از {STEPS.length.toLocaleString(APP_LOCALE)} · {label}
        </span>
        <span className="text-foreground-muted">پیشرفت شما ذخیره می‌شود</span>
      </div>
    </div>
  );
}

export default function OnboardingView() {
  const router = useRouter();
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);

  // SF-QA-038: useTokenStore rehydrates isLoggedIn from localStorage asynchronously, so it reads
  // as false for a moment on every fresh load even for a logged-in user — wait for hydration.
  const [tokenReady, setTokenReady] = useState(false);
  useEffect(() => {
    const persist = useTokenStore.persist;
    if (!persist) return;
    const unsub = persist.onFinishHydration(() => setTokenReady(true));
    if (persist.hasHydrated()) setTokenReady(true);
    return unsub;
  }, []);

  const { canCreateSalon, isLoading: entitlementLoading, isFetched: entitlementFetched } = useSubscriptionEntitlement();

  const draft = useOnboardingDraftStore();
  const { data: serviceTypesRes } = useQueryServiceTypes();
  const serviceTypes = serviceTypesRes?.data ?? [];

  const [error, setError] = useState("");
  /** Field error for «آدرس اختصاصی» (client required-check or server 400); cleared on edit. */
  const [usernameError, setUsernameError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [gateBlocked, setGateBlocked] = useState(false);
  /**
   * Creating a new salon 400s with `{ publicId }` when this user already has a Draft, Pending or
   * Rejected one: draft / rejected can be resumed here; pending is waiting for review.
   */
  const [pendingConflict, setPendingConflict] = useState<{
    kind: "draft" | "pending" | "rejected";
    message: string;
    publicId?: string;
  } | null>(null);
  const [resuming, setResuming] = useState(false);
  const [resumeError, setResumeError] = useState("");

  const hasDraft = !!draft.salonPublicId;

  useEffect(() => {
    if (!tokenReady) return;
    if (!isLoggedIn) {
      router.replace(getLoginHref(RouteAddress.ONBOARDING.BASE));
      return;
    }
    if (!entitlementFetched || entitlementLoading) return;
    // New salon create requires entitlement; resuming a draft is allowed.
    if (!canCreateSalon && !hasDraft) setGateBlocked(true);
  }, [tokenReady, isLoggedIn, entitlementFetched, entitlementLoading, canCreateSalon, hasDraft, router]);

  // An existing owner salon (no local draft) shows the right screen at once instead of a blank
  // step 1 that would only discover the conflict on submit.
  const { data: authMeData } = useQueryAuthMe({ enabled: tokenReady && isLoggedIn });
  const ownerMembership = authMeData?.data?.memberships?.find((m) => m.roleName === SalonRoleName.SalonOwner);
  const { data: ownerSalonRes, isSuccess: ownerSalonFetched } = useQuerySalonById(
    !hasDraft && ownerMembership ? ownerMembership.salonPublicId : undefined
  );

  useEffect(() => {
    if (hasDraft || !ownerMembership || !ownerSalonFetched) return;
    const status = ownerSalonRes?.data?.approvalStatus;
    if (status === SalonApprovalStatus.Approved) {
      router.replace(RouteAddress.DASHBOARD.BASE);
      return;
    }
    if (status === SalonApprovalStatus.Pending) {
      setPendingConflict({
        kind: "pending",
        message: "درخواست ثبت سالن شما در حال بررسی است. بعد از تأیید به شما پیامک می‌دهیم.",
        publicId: ownerMembership.salonPublicId,
      });
      return;
    }
    if (status === SalonApprovalStatus.Draft) {
      setPendingConflict({
        kind: "draft",
        message: "ثبت یک سالن را شروع کرده‌اید؛ همان را ادامه دهید.",
        publicId: ownerMembership.salonPublicId,
      });
      return;
    }
    if (status === SalonApprovalStatus.Rejected) {
      const reason = ownerSalonRes?.data?.rejectionReason;
      setPendingConflict({
        kind: "rejected",
        message: reason
          ? `دلیل: ${reason}`
          : "دلیلی ثبت نشده است. اطلاعات را اصلاح کنید و دوباره برای بررسی بفرستید.",
        publicId: ownerMembership.salonPublicId,
      });
    }
  }, [hasDraft, ownerMembership, ownerSalonFetched, ownerSalonRes, router]);

  const step = Math.min(STEPS.length, Math.max(1, draft.step));
  const goTo = (n: number) => {
    setError("");
    setShowErrors(false);
    draft.setStep(n);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  // Step 4 always has exactly one owner row (the backend requires it) with a branch, and nobody
  // keeps a service that no longer exists.
  useEffect(() => {
    if (step !== 4) return;
    const { staff, services, branches, setStaff } = useOnboardingDraftStore.getState();
    const firstBranch = String(branches.find((b) => b.publicId)?.publicId ?? "");
    let next = pruneStaffOfferings(staff, services);
    if (!next.some((s) => s.isCreator)) {
      next = [
        { publicId: null, branchPublicId: firstBranch, isCreator: true, phoneNumber: null, offeringPublicIds: offeringIdsFromServices(services) },
        ...next,
      ];
    }
    next = next.map((s) => (s.branchPublicId || !firstBranch ? s : { ...s, branchPublicId: firstBranch }));
    if (JSON.stringify(next) !== JSON.stringify(staff)) setStaff(next);
  }, [step, draft.services]);

  // A first visit to «شعبه» starts with one empty card instead of an empty page.
  useEffect(() => {
    if (step === 2 && draft.branches.length === 0) draft.setBranches([newBranch()]);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Stops with inline errors and a short message right above the buttons. */
  const invalid = (message: string) => {
    setShowErrors(true);
    setError(message);
  };

  const saveStep = async () => {
    setError("");
    setSaving(true);
    try {
      if (step === 1) {
        if (!draft.basicInfo.name.trim()) return invalid("نام سالن را بنویسید.");
        const username = draft.basicInfo.username?.trim() ?? "";
        // Required on create; on an existing draft an empty value keeps the server's current one.
        if (!draft.salonPublicId && !username) {
          setUsernameError("آدرس اختصاصی سالن را بنویسید.");
          return invalid("آدرس اختصاصی سالن را بنویسید.");
        }
        const res = await salonService.saveBasicInfo({
          publicId: draft.salonPublicId,
          name: draft.basicInfo.name.trim(),
          username: username || null,
          description: draft.basicInfo.description || null,
          instagramHandle: draft.basicInfo.instagramHandle || null,
          whatsappNumber: draft.basicInfo.whatsappNumber || null,
          websiteUrl: draft.basicInfo.websiteUrl || null,
        });
        const publicId = res.data?.publicId;
        if (!publicId) throw new Error("شناسه سالن از سرور دریافت نشد.");
        draft.setSalonPublicId(publicId);
        goTo(2);
        return;
      }

      const salonPublicId = draft.salonPublicId;
      if (!salonPublicId) throw new Error("ابتدا اطلاعات سالن را ذخیره کنید.");

      if (step === 2) {
        if (draft.branches.length === 0) return invalid("حداقل یک شعبه لازم است.");
        if (draft.branches.some((b) => !isBranchComplete(b))) {
          return invalid("نام، شهر، آدرس و مشتری‌های همه‌ی شعبه‌ها را کامل کنید.");
        }
        const previous = draft.branches;
        const res = await salonService.saveBranches(salonPublicId, previous.map((b) => ({ ...b, publicId: b.publicId || null })));
        const saved = res.data ?? [];
        if (saved.length === 0) throw new Error("لیست شعبه‌ها از سرور دریافت نشد.");
        draft.setBranches(saved);
        if (draft.staff.length > 0) draft.setStaff(remapStaffBranchIds(draft.staff, previous, saved));
        goTo(3);
        return;
      }

      if (step === 3) {
        if (draft.services.length === 0) return invalid("حداقل یک خدمت اضافه کنید.");
        if (draft.services.some((s) => !(s.basePrice > 0))) return invalid("قیمت همه‌ی خدمت‌ها باید بیشتر از صفر باشد.");
        if (draft.services.some((s) => !isValidServiceDuration(s.durationMinutes))) {
          return invalid("مدت هر خدمت باید مضرب 15 دقیقه باشد (بین 15 دقیقه تا 12 ساعت).");
        }
        const res = await salonService.saveServices(salonPublicId, draft.services.map((s) => ({ ...s, publicId: s.publicId || null })));
        const saved = res.data ?? [];
        if (saved.length === 0) throw new Error("لیست خدمات از سرور دریافت نشد.");
        draft.setServices(saved);
        draft.setStaff(pruneStaffOfferings(useOnboardingDraftStore.getState().staff, saved));
        goTo(4);
        return;
      }

      if (step === 4) {
        const staff = pruneStaffOfferings(draft.staff, draft.services);
        if (staff.filter((s) => s.isCreator).length !== 1) return invalid("اطلاعات شما (مالک) کامل نیست؛ صفحه را دوباره باز کنید.");
        for (const s of staff) {
          if (!s.branchPublicId) return invalid("شعبه‌ی همه را مشخص کنید.");
          if (!s.isCreator && !/^09\d{9}$/.test(s.phoneNumber ?? "")) return invalid("شماره‌ی موبایل همکار را درست بنویسید.");
          if (s.offeringPublicIds.length < 1) return invalid("برای هر نفر حداقل یک خدمت انتخاب کنید.");
        }
        if (!draft.schedule.some((d) => !d.isOffDay)) return invalid("حداقل یک روز کاری لازم است.");
        draft.setStaff(staff);
        await salonService.saveStaff(salonPublicId, staff);
        await salonService.saveMySchedule(salonPublicId, draft.schedule);
        goTo(5);
        return;
      }

      if (step === 5) {
        await salonService.submitForReview(salonPublicId);
        draft.setSubmitted(true);
      }
    } catch (e) {
      const message =
        e instanceof Error && !("response" in e) ? e.message : getApiErrorMessage(e, "ذخیره‌ی این مرحله ناموفق بود.");

      // Username 400 = nothing was saved; show it under the field and keep every typed value.
      const usernameFieldError = step === 1 ? getApiFieldErrorMessage(e, "username") : undefined;
      if (usernameFieldError) {
        setUsernameError(usernameFieldError);
        setError(usernameFieldError);
        return;
      }

      // Creating a brand-new salon 400s with { publicId } when the user already has one.
      if (step === 1 && !draft.salonPublicId) {
        const conflictData = getApiErrorFieldData<{ publicId?: string }>(e);
        if (conflictData?.publicId) {
          const kind = message.includes("پیش‌نویس") ? "draft" : "pending";
          setPendingConflict({ kind, message, publicId: conflictData.publicId });
          return;
        }
      }

      // Submit checks name what is missing: open that step with the message.
      if (step === 5) {
        const target = getApiFieldErrorMessage(e, "Branches")
          ? 2
          : getApiFieldErrorMessage(e, "Services")
            ? 3
            : getApiFieldErrorMessage(e, "Staff") || getApiFieldErrorMessage(e, "Schedule")
              ? 4
              : null;
        if (target) {
          goTo(target);
          setError(message);
          return;
        }
      }

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  /** Rehydrates the local draft from the server's copy (other device / cleared storage) and lands
   * on the first step that still misses data. */
  const resumeDraft = async (publicId: string) => {
    setResuming(true);
    setResumeError("");
    try {
      const [draftRes, rosterRes] = await Promise.all([
        salonService.getOnboardingDraft(publicId),
        salonService.getStaff(publicId),
      ]);
      const data = draftRes.data;
      if (!data) throw new Error("اطلاعات پیش‌نویس از سرور دریافت نشد.");

      draft.setBasicInfo({
        name: data.name,
        username: data.username ?? "",
        description: data.description ?? "",
        instagramHandle: data.instagramHandle ?? "",
        whatsappNumber: data.whatsappNumber ?? "",
        websiteUrl: data.websiteUrl ?? "",
      });
      draft.setBranches(data.branches);
      draft.setServices(data.services);

      const roster = rosterRes.data ?? [];
      if (roster.length > 0) {
        draft.setStaff(
          roster.map((s) => ({
            publicId: s.publicId,
            branchPublicId: s.branchPublicId,
            isCreator: s.isCreator,
            phoneNumber: s.phoneNumber,
            offeringPublicIds: s.offeringPublicIds,
          }))
        );
      }
      // Never saved yet server-side → keep this browser's default week.
      if (data.schedule.length > 0) {
        draft.setSchedule(
          data.schedule.map((d) => ({ dayOfWeek: d.dayOfWeek, isOffDay: d.isOffDay, startTime: d.startTime, endTime: d.endTime }))
        );
      }

      const staffWithOfferings = roster.filter((s) => s.offeringPublicIds.length > 0);
      const resumeStep =
        data.branches.length === 0 ? 2 : data.services.length === 0 ? 3 : staffWithOfferings.length === 0 || data.schedule.length === 0 ? 4 : 5;

      draft.setSalonPublicId(publicId);
      goTo(resumeStep);
      setPendingConflict(null);
    } catch (e) {
      setResumeError(getApiErrorMessage(e, "بارگذاری پیش‌نویس ناموفق بود."));
    } finally {
      setResuming(false);
    }
  };

  if (pendingConflict) {
    const isDraft = pendingConflict.kind === "draft";
    const isRejected = pendingConflict.kind === "rejected";
    const canResume = (isDraft || isRejected) && !!pendingConflict.publicId;
    return (
      <div className="flex flex-col gap-4 px-safe-area pb-24 pt-4">
        <TopNavigation fallbackHref={RouteAddress.HOME.BASE}>ثبت سالن</TopNavigation>
        <div className={cn("rounded-[24px] p-6 text-center", isRejected ? "border border-critical/30 bg-critical/10" : "bg-surface")}>
          <p className="text-base font-bold text-foreground">
            {isDraft ? "ثبت سالن نیمه‌کاره دارید" : isRejected ? "درخواست ثبت سالن شما رد شده است" : "درخواست شما در حال بررسی است"}
          </p>
          <p className="mt-2 text-sm leading-6 text-foreground-muted">{pendingConflict.message}</p>
          {resumeError && <p className="mt-2 text-xs text-error">{resumeError}</p>}
          <div className="mt-6 flex flex-col gap-2">
            {canResume && (
              <button
                type="button"
                disabled={resuming}
                onClick={() => resumeDraft(pendingConflict.publicId!)}
                className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"
              >
                {resuming ? "در حال بارگذاری…" : isRejected ? "اصلاح و ارسال دوباره" : "ادامه‌ی ثبت سالن"}
              </button>
            )}
            <Link href={RouteAddress.HOME.BASE} className="inline-flex justify-center rounded-full bg-background-secondary px-6 py-3 text-sm font-bold text-foreground">
              بازگشت به خانه
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (gateBlocked) {
    return (
      <div className="flex flex-col gap-4 px-safe-area pb-24 pt-4">
        <TopNavigation fallbackHref={RouteAddress.HOME.BASE}>ثبت سالن</TopNavigation>
        <div className="rounded-[24px] bg-surface p-6 text-center">
          <p className="text-base font-bold text-foreground">برای ثبت سالن، اول اشتراک را فعال کنید</p>
          <p className="mt-2 text-sm leading-6 text-foreground-muted">
            اشتراک فعالی ندارید یا به سقف تعداد سالن‌های طرحتان رسیده‌اید. می‌توانید طرح آزمایشی را فعال کنید.
          </p>
          <Link
            href={`${RouteAddress.SUBSCRIPTIONS.BASE}?from=onboarding`}
            className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
          >
            مشاهده‌ی اشتراک‌ها
          </Link>
        </div>
      </div>
    );
  }

  if (draft.submitted) {
    return (
      <div className="flex flex-col gap-4 px-safe-area pb-24 pt-4">
        <TopNavigation fallbackHref={RouteAddress.HOME.BASE}>ثبت سالن</TopNavigation>
        <div className="flex flex-col items-center rounded-[24px] bg-surface p-6 text-center">
          <CheckCircleIcon size={48} weight="duotone" className="text-primary" />
          <p className="mt-3 text-lg font-bold text-foreground">سالن برای بررسی ارسال شد</p>
          <p className="mt-2 text-sm leading-6 text-foreground-muted">
            تیم صفا اطلاعات را بررسی می‌کند. بعد از تأیید به شما پیامک می‌دهیم، سالن در صفا دیده می‌شود و «پنل سالن» از
            پروفایل شما باز می‌شود. اگر چیزی نیاز به اصلاح داشته باشد، دلیلش را همین‌جا می‌بینید.
          </p>
          <Link
            href={RouteAddress.HOME.BASE}
            className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground"
            onClick={() => draft.reset()}
          >
            بازگشت به خانه
          </Link>
        </div>
      </div>
    );
  }

  if (!tokenReady || !isLoggedIn || (entitlementLoading && !hasDraft)) {
    return <div className="flex min-h-[40vh] items-center justify-center text-sm text-foreground-muted">در حال بارگذاری…</div>;
  }

  return (
    <div className="flex flex-col pb-36">
      <TopNavigation fallbackHref={RouteAddress.HOME.BASE}>ثبت سالن</TopNavigation>
      <Progress step={step} canJump={!!draft.salonPublicId} onJump={goTo} />

      <div className="flex flex-col gap-4 px-safe-area">
        {step === 1 && (
          <StepSalon usernameError={usernameError} onUsernameErrorClear={() => setUsernameError("")} showErrors={showErrors} />
        )}
        {step === 2 && <StepBranches showErrors={showErrors} />}
        {step === 3 && <StepServices serviceTypes={serviceTypes} />}
        {step === 4 && <StepTeam serviceTypes={serviceTypes} showErrors={showErrors} />}
        {step === 5 && <StepPhotosSubmit serviceTypes={serviceTypes} onEdit={goTo} />}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-center border-t border-border bg-background/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="flex w-full max-w-[600px] flex-col gap-2">
          {error ? <p className="rounded-[12px] bg-error/10 px-3 py-2 text-xs text-error">{error}</p> : null}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => (step === 1 ? router.push(RouteAddress.HOME.BASE) : goTo(step - 1))}
              className="flex-1 rounded-full bg-surface py-4 text-sm font-bold text-foreground"
            >
              {step === 1 ? "بعداً" : "قبلی"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveStep()}
              className="flex-[2] rounded-full bg-primary py-4 text-sm font-bold text-primary-foreground disabled:opacity-40"
            >
              {saving ? "در حال ذخیره…" : step === 5 ? "ارسال برای بررسی" : "ذخیره و ادامه"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
