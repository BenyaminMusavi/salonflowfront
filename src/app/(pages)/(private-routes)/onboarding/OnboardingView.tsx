"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Stepper } from "@/shared/components/primitives/stepper/Stepper";
import TopNavigation from "@/shared/components/composites/layout/top-navigation/TopNavigation";
import { useSubscriptionEntitlement } from "@/services/domains/subscriptions/hooks/useSubscriptionEntitlement";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useQueryServiceTypes } from "@/services/domains/service-type/hooks/useQueryServiceTypes";
import salonService from "@/services/domains/salons/salon.service";
import {
  DAY_LABELS,
  GENDER_TYPE_OPTIONS,
  useOnboardingDraftStore,
} from "@/services/domains/salons/store/useOnboardingDraftStore";
import {
  IOnboardingBranch,
  IOnboardingService,
  IOnboardingStaff,
} from "@/services/domains/salons/types/onboarding.type";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { RouteAddress } from "@/shared/data/routeAddress";
import { cn } from "@/shared/utils/className";
import { GenderType } from "@/services/common/enums/domain-enums";

const STEPS = [
  { id: 1, label: "اطلاعات" },
  { id: 2, label: "شعبه‌ها" },
  { id: 3, label: "خدمات" },
  { id: 4, label: "پرسنل" },
  { id: 5, label: "رسانه" },
  { id: 6, label: "برنامه" },
  { id: 7, label: "ارسال" },
];

function newId() {
  return crypto.randomUUID();
}

function isBranchComplete(b: IOnboardingBranch) {
  return Boolean(b.name.trim() && b.city.trim() && b.address.trim());
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
    if (!nextId) return;
    if (old.publicId && old.publicId !== nextId) {
      remap.set(String(old.publicId), String(nextId));
    }
  });
  if (remap.size === 0) return staff;
  return staff.map((s) => ({
    ...s,
    branchPublicId: remap.get(s.branchPublicId) ?? s.branchPublicId,
  }));
}

const fieldClass =
  "rounded-2xl bg-input border border-input-border px-3 py-2 text-sm text-foreground outline-none placeholder:text-input-placeholder hover:bg-input-hover focus:bg-input-focus focus:border-border-strong";

const cardClass = "flex flex-col gap-2 rounded-[20px] bg-surface p-4";

export default function OnboardingView() {
  const router = useRouter();
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const setRedirectUrl = useTokenStore((s) => s.setRedirectUrl);

  const {
    canCreateSalon,
    isLoading: entitlementLoading,
    isFetched: entitlementFetched,
  } = useSubscriptionEntitlement();

  const draft = useOnboardingDraftStore();
  const { data: serviceTypesRes } = useQueryServiceTypes();
  const serviceTypes = serviceTypesRes?.data ?? [];

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [gateBlocked, setGateBlocked] = useState(false);

  const hasDraft = !!draft.salonPublicId;

  useEffect(() => {
    if (!isLoggedIn) {
      setRedirectUrl(RouteAddress.ONBOARDING.BASE);
      router.replace(RouteAddress.AUTH.LOGIN.BASE);
      return;
    }
    if (!entitlementFetched || entitlementLoading) return;
    // New salon create requires entitlement; resuming draft is allowed
    if (!canCreateSalon && !hasDraft) {
      setGateBlocked(true);
    }
  }, [
    isLoggedIn,
    entitlementFetched,
    entitlementLoading,
    canCreateSalon,
    hasDraft,
    router,
    setRedirectUrl,
  ]);

  const step = draft.step;

  const ensureSalonPublicId = async () => {
    if (draft.salonPublicId) return draft.salonPublicId;
    throw new Error("ابتدا اطلاعات پایه را ذخیره کنید.");
  };

  const saveStep = async () => {
    setError("");
    setSaving(true);
    try {
      if (step === 1) {
        if (!draft.basicInfo.name.trim()) {
          throw new Error("نام سالن الزامی است.");
        }
        const res = await salonService.saveBasicInfo({
          publicId: draft.salonPublicId,
          name: draft.basicInfo.name.trim(),
          description: draft.basicInfo.description || null,
          instagramHandle: draft.basicInfo.instagramHandle || null,
          whatsappNumber: draft.basicInfo.whatsappNumber || null,
          websiteUrl: draft.basicInfo.websiteUrl || null,
        });
        const publicId = res.data?.publicId;
        if (!publicId) throw new Error("شناسه سالن از سرور دریافت نشد.");
        draft.setSalonPublicId(publicId);
        draft.setStep(2);
        return;
      }

      const salonPublicId = await ensureSalonPublicId();

      if (step === 2) {
        if (draft.branches.length === 0) {
          throw new Error("حداقل یک شعبه اضافه کنید.");
        }
        if (draft.branches.some((b) => !isBranchComplete(b))) {
          throw new Error(
            "برای ادامه، نام، شهر و آدرس همه شعبه‌ها را تکمیل کنید."
          );
        }
        const previousBranches = draft.branches;
        const payload = previousBranches.map((b) => ({
          ...b,
          publicId: b.publicId || null,
        }));
        const res = await salonService.saveBranches(salonPublicId, payload);
        const saved = res.data ?? [];
        if (saved.length === 0) {
          throw new Error("لیست شعبه‌ها از سرور دریافت نشد.");
        }
        draft.setBranches(saved);
        if (draft.staff.length > 0) {
          draft.setStaff(
            remapStaffBranchIds(draft.staff, previousBranches, saved)
          );
        }
        draft.setStep(3);
        return;
      }

      if (step === 3) {
        if (draft.services.length === 0) {
          throw new Error("حداقل یک خدمت اضافه کنید.");
        }
        await salonService.saveServices(salonPublicId, draft.services);
        draft.setStep(4);
        return;
      }

      if (step === 4) {
        if (draft.staff.length === 0) {
          throw new Error("حداقل یک عضو پرسنل اضافه کنید.");
        }
        for (const s of draft.staff) {
          if (!s.branchPublicId) throw new Error("شعبه هر پرسنل را مشخص کنید.");
          if (!s.isCreator && !s.phoneNumber?.trim()) {
            throw new Error("شماره موبایل برای پرسنل غیرمالک الزامی است.");
          }
        }
        await salonService.saveStaff(salonPublicId, draft.staff);
        draft.setStep(5);
        return;
      }

      if (step === 5) {
        if (mediaFiles.length > 0) {
          await salonService.saveMedias(salonPublicId, mediaFiles);
        }
        draft.setStep(6);
        return;
      }

      if (step === 6) {
        await salonService.saveMySchedule(salonPublicId, draft.schedule);
        draft.setStep(7);
        return;
      }

      if (step === 7) {
        await salonService.submitForReview(salonPublicId);
        draft.setSubmitted(true);
      }
    } catch (e) {
      setError(
        e instanceof Error && !("response" in e)
          ? e.message
          : getApiErrorMessage(e, "ذخیره این مرحله ناموفق بود.")
      );
    } finally {
      setSaving(false);
    }
  };

  const lastBranch = draft.branches[draft.branches.length - 1];
  const canAddBranch =
    draft.branches.length === 0 ||
    (lastBranch != null && isBranchComplete(lastBranch));

  const addBranch = () => {
    if (!canAddBranch) {
      setError(
        "برای افزودن شعبه جدید، نام، شهر و آدرس شعبه قبلی را تکمیل کنید."
      );
      return;
    }
    setError("");
    const branch: IOnboardingBranch = {
      publicId: null,
      name: "",
      city: "",
      address: "",
      latitude: null,
      longitude: null,
      genderType: GenderType.Male,
      phone: "",
    };
    draft.setBranches([...draft.branches, branch]);
  };

  const addService = () => {
    const firstType = serviceTypes[0];
    const svc: IOnboardingService = {
      publicId: newId(),
      serviceTypePublicId: String(firstType?.id ?? ""),
      basePrice: 0,
      durationMinutes: 45,
    };
    draft.setServices([...draft.services, svc]);
  };

  const addStaff = () => {
    const firstBranch = draft.branches[0]?.publicId;
    const member: IOnboardingStaff = {
      publicId: newId(),
      branchPublicId: firstBranch ? String(firstBranch) : "",
      isCreator: draft.staff.length === 0,
      phoneNumber: null,
    };
    draft.setStaff([...draft.staff, member]);
  };

  if (gateBlocked) {
    return (
      <div className="flex flex-col gap-4 px-safe-area pb-24 pt-6">
        <TopNavigation>ثبت سالن</TopNavigation>
        <div className="rounded-[24px] bg-surface p-6 text-center">
          <p className="text-base font-bold text-foreground">
            برای ایجاد سالن جدید اشتراک لازم است
          </p>
          <p className="mt-2 text-sm text-foreground-muted">
            یا اشتراک ندارید یا به سقف تعداد سالن طرح رسیده‌اید. ابتدا طرح
            آزمایشی/خرید را فعال کنید.
          </p>
          <Link
            href={`${RouteAddress.SUBSCRIPTIONS.BASE}?from=onboarding`}
            className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
          >
            مشاهده اشتراک‌ها
          </Link>
        </div>
      </div>
    );
  }

  if (draft.submitted) {
    return (
      <div className="flex flex-col gap-4 px-safe-area pb-24 pt-6">
        <TopNavigation>ثبت سالن</TopNavigation>
        <div className="rounded-[24px] bg-surface p-6 text-center">
          <p className="text-lg font-bold text-foreground">
            در انتظار تأیید ادمین
          </p>
          <p className="mt-2 text-sm text-foreground-muted">
            سالن شما برای بررسی ارسال شد. پس از تأیید، در کاتالوگ عمومی نمایش
            داده می‌شود.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href={RouteAddress.HOME.BASE}
              className="rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground"
              onClick={() => draft.reset()}
            >
              بازگشت به خانه
            </Link>
            <button
              type="button"
              onClick={() => draft.reset()}
              className="text-sm text-foreground-muted"
            >
              شروع ثبت سالن جدید
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || (entitlementLoading && !hasDraft)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-foreground-muted">
        در حال بارگذاری…
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-28">
      <TopNavigation>ثبت سالن</TopNavigation>
      <Stepper
        steps={STEPS.map((s) => ({ ...s, complete: s.id < step }))}
        activeStep={step}
        onStepClick={(id) => {
          if (id < step || draft.salonPublicId) draft.setStep(id);
        }}
      />

      <div className="flex flex-col gap-4 px-safe-area">
        {error && (
          <p className="rounded-2xl bg-error/10 px-4 py-3 text-xs text-error">
            {error}
          </p>
        )}

        {/* Step 1 — Basic info */}
        {step === 1 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold">اطلاعات پایه</h2>
            {(
              [
                ["name", "نام سالن *"],
                ["description", "توضیحات"],
                ["instagramHandle", "اینستاگرام"],
                ["whatsappNumber", "واتساپ"],
                ["websiteUrl", "وبسایت"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex flex-col gap-1 text-sm">
                <span className="text-foreground-muted">{label}</span>
                {key === "description" ? (
                  <textarea
                    rows={3}
                    value={draft.basicInfo[key] ?? ""}
                    onChange={(e) =>
                      draft.setBasicInfo({ [key]: e.target.value })
                    }
                    className={fieldClass}
                  />
                ) : (
                  <input
                    value={draft.basicInfo[key] ?? ""}
                    onChange={(e) =>
                      draft.setBasicInfo({ [key]: e.target.value })
                    }
                    className={fieldClass}
                  />
                )}
              </label>
            ))}
          </section>
        )}

        {/* Step 2 — Branches */}
        {step === 2 && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">شعبه‌ها</h2>
              <button
                type="button"
                onClick={addBranch}
                disabled={!canAddBranch}
                className={cn(
                  "text-sm font-bold text-primary",
                  !canAddBranch && "cursor-not-allowed opacity-40"
                )}
              >
                + افزودن
              </button>
            </div>
            {draft.branches.map((b, idx) => (
              <div
                key={b.publicId ?? idx}
                className={cardClass}
              >
                <input
                  placeholder="نام شعبه"
                  value={b.name}
                  onChange={(e) => {
                    const next = [...draft.branches];
                    next[idx] = { ...b, name: e.target.value };
                    draft.setBranches(next);
                  }}
                  className={fieldClass}
                />
                <input
                  placeholder="شهر"
                  value={b.city}
                  onChange={(e) => {
                    const next = [...draft.branches];
                    next[idx] = { ...b, city: e.target.value };
                    draft.setBranches(next);
                  }}
                  className={fieldClass}
                />
                <input
                  placeholder="آدرس"
                  value={b.address}
                  onChange={(e) => {
                    const next = [...draft.branches];
                    next[idx] = { ...b, address: e.target.value };
                    draft.setBranches(next);
                  }}
                  className={fieldClass}
                />
                <input
                  placeholder="تلفن"
                  value={b.phone ?? ""}
                  onChange={(e) => {
                    const next = [...draft.branches];
                    next[idx] = { ...b, phone: e.target.value };
                    draft.setBranches(next);
                  }}
                  className={fieldClass}
                />
                <select
                  value={b.genderType}
                  onChange={(e) => {
                    const next = [...draft.branches];
                    next[idx] = {
                      ...b,
                      genderType: Number(e.target.value) as GenderType,
                    };
                    draft.setBranches(next);
                  }}
                  className={fieldClass}
                >
                  {GENDER_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() =>
                    draft.setBranches(draft.branches.filter((_, i) => i !== idx))
                  }
                  className="text-xs text-error"
                >
                  حذف شعبه
                </button>
              </div>
            ))}
          </section>
        )}

        {/* Step 3 — Services */}
        {step === 3 && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">خدمات</h2>
              <button
                type="button"
                onClick={addService}
                className="text-sm font-bold text-primary"
              >
                + افزودن
              </button>
            </div>
            {draft.services.map((s, idx) => (
              <div
                key={s.publicId ?? idx}
                className={cardClass}
              >
                <select
                  value={s.serviceTypePublicId}
                  onChange={(e) => {
                    const next = [...draft.services];
                    next[idx] = {
                      ...s,
                      serviceTypePublicId: e.target.value,
                    };
                    draft.setServices(next);
                  }}
                  className={fieldClass}
                >
                  <option value="">نوع خدمت</option>
                  {serviceTypes.map((t) => (
                    <option key={String(t.id)} value={String(t.id)}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="قیمت (تومان)"
                  value={s.basePrice || ""}
                  onChange={(e) => {
                    const next = [...draft.services];
                    next[idx] = {
                      ...s,
                      basePrice: Number(e.target.value) || 0,
                    };
                    draft.setServices(next);
                  }}
                  className={fieldClass}
                />
                <input
                  type="number"
                  placeholder="مدت (دقیقه)"
                  value={s.durationMinutes || ""}
                  onChange={(e) => {
                    const next = [...draft.services];
                    next[idx] = {
                      ...s,
                      durationMinutes: Number(e.target.value) || 0,
                    };
                    draft.setServices(next);
                  }}
                  className={fieldClass}
                />
                <button
                  type="button"
                  onClick={() =>
                    draft.setServices(draft.services.filter((_, i) => i !== idx))
                  }
                  className="text-xs text-error"
                >
                  حذف خدمت
                </button>
              </div>
            ))}
          </section>
        )}

        {/* Step 4 — Staff */}
        {step === 4 && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">پرسنل</h2>
              <button
                type="button"
                onClick={addStaff}
                className="text-sm font-bold text-primary"
              >
                + افزودن
              </button>
            </div>
            {draft.staff.map((s, idx) => (
              <div
                key={s.publicId ?? idx}
                className={cardClass}
              >
                <select
                  value={s.branchPublicId}
                  onChange={(e) => {
                    const next = [...draft.staff];
                    next[idx] = { ...s, branchPublicId: e.target.value };
                    draft.setStaff(next);
                  }}
                  className={fieldClass}
                >
                  <option value="">انتخاب شعبه</option>
                  {draft.branches.map((b) => (
                    <option key={String(b.publicId)} value={String(b.publicId)}>
                      {b.name || "شعبه بدون نام"}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={s.isCreator}
                    onChange={(e) => {
                      const next = [...draft.staff];
                      next[idx] = {
                        ...s,
                        isCreator: e.target.checked,
                        phoneNumber: e.target.checked ? null : s.phoneNumber,
                      };
                      draft.setStaff(next);
                    }}
                  />
                  مالک / سازنده
                </label>
                {!s.isCreator && (
                  <input
                    placeholder="موبایل پرسنل"
                    value={s.phoneNumber ?? ""}
                    onChange={(e) => {
                      const next = [...draft.staff];
                      next[idx] = { ...s, phoneNumber: e.target.value };
                      draft.setStaff(next);
                    }}
                    className={fieldClass}
                  />
                )}
                <button
                  type="button"
                  onClick={() =>
                    draft.setStaff(draft.staff.filter((_, i) => i !== idx))
                  }
                  className="text-xs text-error"
                >
                  حذف
                </button>
              </div>
            ))}
          </section>
        )}

        {/* Step 5 — Media */}
        {step === 5 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold">رسانه (اختیاری)</h2>
            <p className="text-xs text-foreground-muted">
              حداکثر ۱۰ مگابایت برای هر فایل در این مرحله. می‌توانید رد شوید.
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                setMediaFiles(Array.from(e.target.files ?? []))
              }
              className="text-sm"
            />
            {mediaFiles.length > 0 && (
              <ul className="text-xs text-foreground-muted">
                {mediaFiles.map((f) => (
                  <li key={f.name + f.size}>{f.name}</li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Step 6 — Schedule */}
        {step === 6 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold">برنامه کاری مالک</h2>
            {draft.schedule.map((day, idx) => (
              <div
                key={day.dayOfWeek}
                className="flex flex-col gap-2 rounded-[16px] bg-surface p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    {DAY_LABELS[day.dayOfWeek]}
                  </span>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={day.isOffDay}
                      onChange={(e) => {
                        const next = [...draft.schedule];
                        next[idx] = {
                          ...day,
                          isOffDay: e.target.checked,
                          startTime: e.target.checked ? null : "09:00:00",
                          endTime: e.target.checked ? null : "18:00:00",
                        };
                        draft.setSchedule(next);
                      }}
                    />
                    تعطیل
                  </label>
                </div>
                {!day.isOffDay && (
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={(day.startTime ?? "09:00:00").slice(0, 5)}
                      onChange={(e) => {
                        const next = [...draft.schedule];
                        next[idx] = {
                          ...day,
                          startTime: `${e.target.value}:00`,
                        };
                        draft.setSchedule(next);
                      }}
                      className={cn(fieldClass, "flex-1")}
                    />
                    <input
                      type="time"
                      value={(day.endTime ?? "18:00:00").slice(0, 5)}
                      onChange={(e) => {
                        const next = [...draft.schedule];
                        next[idx] = {
                          ...day,
                          endTime: `${e.target.value}:00`,
                        };
                        draft.setSchedule(next);
                      }}
                      className={cn(fieldClass, "flex-1")}
                    />
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Step 7 — Submit */}
        {step === 7 && (
          <section className="flex flex-col gap-3 rounded-[24px] bg-surface p-5">
            <h2 className="text-base font-bold">ارسال برای بررسی</h2>
            <p className="text-sm text-foreground-muted">
              با تأیید، سالن «{draft.basicInfo.name}» برای تأیید ادمین ارسال
              می‌شود و تا زمان Approve در کاتالوگ عمومی دیده نمی‌شود.
            </p>
            <ul className="text-xs text-foreground-muted list-disc pe-5">
              <li>{draft.branches.length} شعبه</li>
              <li>{draft.services.length} خدمت</li>
              <li>{draft.staff.length} پرسنل</li>
            </ul>
          </section>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-center bg-background/95 p-4 backdrop-blur">
        <div className="flex w-full max-w-[600px] gap-3">
          <button
            type="button"
            onClick={() => {
              setError("");
              if (step === 1) router.push(RouteAddress.HOME.BASE);
              else draft.setStep(Math.max(1, step - 1));
            }}
            className="flex-1 rounded-full bg-surface py-4 text-sm font-bold"
          >
            بازگشت
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={saveStep}
            className={cn(
              "flex-[2] rounded-full bg-primary py-4 text-sm font-bold text-primary-foreground disabled:opacity-40"
            )}
          >
            {saving
              ? "در حال ذخیره…"
              : step === 7
                ? "ارسال برای بررسی"
                : step === 5 && mediaFiles.length === 0
                  ? "رد شدن / ادامه"
                  : "ذخیره و ادامه"}
          </button>
        </div>
      </div>
    </div>
  );
}
