"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { RouteAddress } from "@/shared/data/routeAddress";
import { Button } from "@/shared/components/primitives/button/Button";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useOnboardingDraftStore } from "@/services/domains/salons/store/useOnboardingDraftStore";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { useMutateSalonBasicInfo } from "@/services/domains/salons/hooks/useMutateSalonBasicInfo";
import { useMutateSalonBranches } from "@/services/domains/salons/hooks/useMutateSalonBranches";
import {
  getApiErrorMessage,
  getApiFieldErrorMessage,
} from "@/services/domains/booking/utils/booking-mappers";
import { SalonApprovalStatus } from "@/services/common/enums/domain-enums";
import SalonLinkCard from "@/shared/components/composites/salon-share/SalonLinkCard";
import type { IOnboardingBranch } from "@/services/domains/salons/types/onboarding.type";
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardToast,
  type DashboardToastState,
} from "../_components";
import SalonInfoJumpNav, {
  SALON_INFO_SECTIONS,
} from "./components/SalonInfoJumpNav";
import SalonStatusBanner from "./components/SalonStatusBanner";
import SalonInfoSkeleton from "./components/SalonInfoSkeleton";
import SalonInfoEmptyState from "./components/SalonInfoEmptyState";
import BasicInfoSection, {
  type BasicInfoValues,
} from "./components/sections/BasicInfoSection";
import ContactSocialSection, {
  type ContactSocialValues,
} from "./components/sections/ContactSocialSection";
import MediaSection, {
  createEmptyMediaSlot,
  type GalleryMediaItem,
  type MediaSlotState,
} from "./components/sections/MediaSection";
import BranchesSection from "./components/sections/BranchesSection";
import {
  createEmptyBranch,
  type BranchEditorErrors,
  type BranchEditorValues,
} from "./components/sections/BranchEditorItem";
import {
  mapSalonToBanner,
  mapSalonToBasicInfo,
  mapSalonToBranches,
  mapSalonToContactInfo,
  mapSalonToCover,
  mapSalonToGallery,
  mapSalonToLogo,
} from "./utils/mapSalonToForm";

function toOnboardingBranches(
  branches: BranchEditorValues[]
): IOnboardingBranch[] {
  return branches.map((b) => ({
    publicId: b.publicId,
    name: b.name.trim(),
    city: b.city.trim(),
    address: b.address.trim(),
    latitude: b.latitude,
    longitude: b.longitude,
    genderType: b.genderType,
    phone: b.phone.trim() || null,
    isActive: b.isActive,
  }));
}

/** Stable signature for dirty-checking a branch list — deliberately excludes
 * `clientKey`, which is a fresh random id on every hydration and would make an
 * otherwise-unchanged list look dirty. */
function branchesSignature(list: BranchEditorValues[]): string {
  return JSON.stringify(
    list.map((b) => ({
      publicId: b.publicId,
      name: b.name.trim(),
      city: b.city.trim(),
      address: b.address.trim(),
      phone: b.phone.trim(),
      genderType: b.genderType,
      latitude: b.latitude,
      longitude: b.longitude,
      isActive: b.isActive,
    }))
  );
}

export default function SalonInfoView() {
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const salonId = useSalonContextStore((s) => s.salonId);
  const branchId = useSalonContextStore((s) => s.branchId);
  const setActiveContext = useSalonContextStore((s) => s.setActiveContext);
  const draftSalonPublicId = useOnboardingDraftStore((s) => s.salonPublicId);
  const draftSubmitted = useOnboardingDraftStore((s) => s.submitted);
  const draftStep = useOnboardingDraftStore((s) => s.step);
  const setDraftBasicInfo = useOnboardingDraftStore((s) => s.setBasicInfo);
  const setDraftBranches = useOnboardingDraftStore((s) => s.setBranches);
  const setDraftStaff = useOnboardingDraftStore((s) => s.setStaff);

  const salonQuery = useQuerySalonById(salonPublicId || undefined);
  const salon = salonQuery.data?.data;

  const saveBasicInfo = useMutateSalonBasicInfo();
  const saveBranches = useMutateSalonBranches();

  const isIncompleteDraft =
    !!salonPublicId &&
    draftSalonPublicId === salonPublicId &&
    !draftSubmitted &&
    draftStep < 7;

  const hydratedForIdRef = useRef<string | null>(null);

  const [activeSectionId, setActiveSectionId] = useState<string>(
    SALON_INFO_SECTIONS[0].id
  );
  const [basicInfo, setBasicInfo] = useState<BasicInfoValues>({
    name: "",
    username: "",
    description: "",
  });
  /** Server 400 on `username` from the last save; cleared as soon as the field is edited. */
  const [usernameServerError, setUsernameServerError] = useState("");
  const [contactInfo, setContactInfo] = useState<ContactSocialValues>({
    instagramHandle: "",
    whatsappNumber: "",
    websiteUrl: "",
  });
  const [branches, setBranches] = useState<BranchEditorValues[]>([
    createEmptyBranch(),
  ]);
  const [cover, setCover] = useState<MediaSlotState>(createEmptyMediaSlot);
  const [banner, setBanner] = useState<MediaSlotState>(createEmptyMediaSlot);
  const [logo, setLogo] = useState<MediaSlotState>(createEmptyMediaSlot);
  const [gallery, setGallery] = useState<GalleryMediaItem[]>([]);
  const [toast, setToast] = useState<DashboardToastState>(null);

  // Set true the moment a save is attempted for that section; cleared again on a
  // successful save. Drives inline field errors without nagging on first load.
  const [profileSubmitted, setProfileSubmitted] = useState(false);
  const [branchesSubmitted, setBranchesSubmitted] = useState(false);

  // Last-saved (or last-hydrated) snapshot for each section, used purely to
  // detect unsaved local changes — the "تغییرات ذخیره‌نشده" indicators below.
  const profileBaselineRef = useRef<{
    basicInfo: BasicInfoValues;
    contactInfo: ContactSocialValues;
  } | null>(null);
  const branchesBaselineRef = useRef<string | null>(null);

  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    hydratedForIdRef.current = null;
  }, [salonPublicId]);

  useEffect(() => {
    if (!salonPublicId || !salon) return;
    if (hydratedForIdRef.current === salonPublicId) return;

    const nextCover = mapSalonToCover(salon);
    const nextBanner = mapSalonToBanner(salon);
    const nextLogo = mapSalonToLogo(salon);
    const nextGallery = mapSalonToGallery(salon);
    const nextBasicInfo = mapSalonToBasicInfo(salon);
    const nextContactInfo = mapSalonToContactInfo(salon);
    const nextBranches = mapSalonToBranches(salon);

    setBasicInfo(nextBasicInfo);
    setContactInfo(nextContactInfo);
    setCover(nextCover);
    setBanner(nextBanner);
    setLogo(nextLogo);
    setGallery(nextGallery);
    setBranches(nextBranches);

    profileBaselineRef.current = {
      basicInfo: nextBasicInfo,
      contactInfo: nextContactInfo,
    };
    branchesBaselineRef.current = branchesSignature(nextBranches);
    setProfileSubmitted(false);
    setBranchesSubmitted(false);

    hydratedForIdRef.current = salonPublicId;
  }, [salon, salonPublicId]);

  useEffect(() => {
    const elements = SALON_INFO_SECTIONS.map((section) =>
      document.getElementById(section.id)
    ).filter((el): el is HTMLElement => !!el);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              (a.boundingClientRect.top ?? 0) - (b.boundingClientRect.top ?? 0)
          );
        if (visible[0]?.target?.id) {
          setActiveSectionId(visible[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0, 0.25, 0.5],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [salon]);

  const profileDirty =
    !!profileBaselineRef.current &&
    (JSON.stringify(basicInfo) !==
      JSON.stringify(profileBaselineRef.current.basicInfo) ||
      JSON.stringify(contactInfo) !==
        JSON.stringify(profileBaselineRef.current.contactInfo));

  const branchesDirty =
    !!branchesBaselineRef.current &&
    branchesSignature(branches) !== branchesBaselineRef.current;

  const dirtySectionIds = [
    ...(profileDirty ? ["salon-profile"] : []),
    ...(branchesDirty ? ["salon-branches"] : []),
  ];

  // Warn on tab close / refresh while a section has local changes the two batch
  // save buttons haven't sent yet (media saves per-upload, so it's excluded).
  useEffect(() => {
    if (!profileDirty && !branchesDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [profileDirty, branchesDirty]);

  const branchErrors: BranchEditorErrors[] | undefined = branchesSubmitted
    ? branches.map((b) => ({
        name: b.name.trim() ? undefined : "نام شعبه الزامی است.",
        city: b.city.trim() ? undefined : "شهر الزامی است.",
        address: b.address.trim() ? undefined : "آدرس الزامی است.",
      }))
    : undefined;

  const onJump = (id: string) => {
    setActiveSectionId(id);
    // Deferred to the next frame: called straight from the click handler, this
    // scrollIntoView was consistently a no-op (window.scrollY stayed 0) even though
    // the identical call worked when re-run manually from the console a moment later —
    // the classic sign of racing the browser's own layout/paint for this click, not a
    // wrong target (SF-QA-033). rAF lets that settle first.
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const onRetryLoad = () => {
    hydratedForIdRef.current = null;
    void salonQuery.refetch();
  };

  const onSaveBasicContact = async () => {
    setProfileSubmitted(true);
    const name = basicInfo.name.trim();
    if (!salonPublicId) {
      setToast({
        type: "error",
        message: "شناسه سالن فعال پیدا نشد. دوباره وارد پنل شوید.",
      });
      return;
    }
    if (!name) {
      setToast({ type: "error", message: "نام سالن الزامی است." });
      return;
    }
    const username = basicInfo.username.trim();
    if (!username) {
      setToast({ type: "error", message: "آدرس اختصاصی سالن الزامی است." });
      return;
    }

    try {
      await saveBasicInfo.mutateAsync({
        publicId: salonPublicId,
        name,
        username,
        description: basicInfo.description.trim() || null,
        instagramHandle: contactInfo.instagramHandle.trim() || null,
        whatsappNumber: contactInfo.whatsappNumber.trim() || null,
        websiteUrl: contactInfo.websiteUrl.trim() || null,
      });

      setDraftBasicInfo({
        name,
        username,
        description: basicInfo.description.trim(),
        instagramHandle: contactInfo.instagramHandle.trim(),
        whatsappNumber: contactInfo.whatsappNumber.trim(),
        websiteUrl: contactInfo.websiteUrl.trim(),
      });

      if (salonId != null) {
        setActiveContext({
          salonId,
          branchId,
          salonPublicId,
          salonName: name,
        });
      }

      profileBaselineRef.current = { basicInfo, contactInfo };
      setProfileSubmitted(false);
      setUsernameServerError("");
      setToast({ type: "success", message: "اطلاعات سالن با موفقیت ذخیره شد." });
    } catch (err) {
      // A username error means nothing was saved; the form keeps every typed value so
      // only the username needs fixing.
      const usernameError = getApiFieldErrorMessage(err, "username");
      if (usernameError) setUsernameServerError(usernameError);
      setToast({
        type: "error",
        message: usernameError
          ? "آدرس اختصاصی را اصلاح کنید؛ هیچ تغییری ذخیره نشد."
          : getApiErrorMessage(err, "ذخیره اطلاعات سالن ناموفق بود."),
      });
    }
  };

  const onSaveBranches = async () => {
    setBranchesSubmitted(true);
    if (!salonPublicId) {
      setToast({
        type: "error",
        message: "شناسه سالن فعال پیدا نشد. دوباره وارد پنل شوید.",
      });
      return;
    }
    if (branches.length === 0) {
      setToast({ type: "error", message: "حداقل یک شعبه اضافه کنید." });
      return;
    }

    const invalid = branches.find(
      (b) => !b.name.trim() || !b.city.trim() || !b.address.trim()
    );
    if (invalid) {
      setToast({
        type: "error",
        message: "نام، شهر و آدرس هر شعبه الزامی است.",
      });
      return;
    }

    const previousBranches = toOnboardingBranches(branches);
    const payload = previousBranches.map((b) => ({
      ...b,
      publicId: b.publicId || null,
    }));

    try {
      const res = await saveBranches.mutateAsync({
        salonPublicId,
        branches: payload,
      });
      const saved = res.data ?? [];
      if (saved.length === 0) {
        setToast({
          type: "error",
          message: "لیست شعبه‌ها از سرور دریافت نشد.",
        });
        return;
      }

      setDraftBranches(saved);
      const nextBranches = branches.map((b, i) => {
        const server = saved[i];
        if (!server) return b;
        return {
          ...b,
          publicId: server.publicId,
          name: server.name,
          city: server.city,
          address: server.address,
          phone: server.phone ?? "",
          genderType: server.genderType,
          latitude: server.latitude ?? null,
          longitude: server.longitude ?? null,
          isActive: server.isActive,
        };
      });
      setBranches(nextBranches);
      branchesBaselineRef.current = branchesSignature(nextBranches);
      setBranchesSubmitted(false);

      const draftStaff = useOnboardingDraftStore.getState().staff;
      if (draftStaff.length > 0) {
        const remap = new Map<string, string>();
        previousBranches.forEach((old, i) => {
          const nextId = saved[i]?.publicId;
          if (old.publicId && nextId && old.publicId !== nextId) {
            remap.set(String(old.publicId), String(nextId));
          }
        });
        if (remap.size > 0) {
          setDraftStaff(
            draftStaff.map((s) => ({
              ...s,
              branchPublicId: remap.get(s.branchPublicId) ?? s.branchPublicId,
            }))
          );
        }
      }

      setToast({ type: "success", message: "شعبه‌ها با موفقیت ذخیره شدند." });
    } catch (err) {
      setToast({
        type: "error",
        message: getApiErrorMessage(err, "ذخیره شعبه‌ها ناموفق بود."),
      });
    }
  };

  const isApproved = salon?.approvalStatus === SalonApprovalStatus.Approved;
  const showLoading = !!salonPublicId && salonQuery.isLoading && !salon;
  const showError =
    !!salonPublicId &&
    !salonQuery.isLoading &&
    (salonQuery.isError || !salon);
  const showMissingContext = !salonPublicId;

  return (
    <DashboardPage>
      <SalonInfoJumpNav
        activeId={activeSectionId}
        onJump={onJump}
        dirtyIds={dirtySectionIds}
      />

      <DashboardPageHeader
        title="اطلاعات سالن"
        description="ویرایش اطلاعات پایه، تماس، رسانه و شعبه‌ها برای سالن فعال."
      />

      {showMissingContext && (
        <SalonInfoEmptyState
          title="سالن فعالی انتخاب نشده"
          description="برای ویرایش اطلاعات، ابتدا از طریق تعویض کسب‌وکار یک سالن را فعال کنید یا ثبت سالن را تکمیل کنید."
          showOnboardingCta
        />
      )}

      {showLoading && <SalonInfoSkeleton />}

      {showError && (
        <SalonInfoEmptyState
          title="اطلاعات سالن در دسترس نیست"
          description={
            isIncompleteDraft
              ? "این سالن هنوز تکمیل یا تأیید نشده و جزئیات عمومی آن قابل دریافت نیست. ثبت‌نام را ادامه دهید یا دوباره تلاش کنید."
              : getApiErrorMessage(
                  salonQuery.error,
                  "دریافت جزئیات سالن ناموفق بود. ممکن است سالن هنوز عمومی/تأیید نشده باشد."
                )
          }
          onRetry={onRetryLoad}
          isRetrying={salonQuery.isFetching}
          showOnboardingCta
        />
      )}

      {salon && (
        <>
          <SalonStatusBanner
            show={isIncompleteDraft}
            approvalStatus={salon.approvalStatus}
            rejectionReason={salon.rejectionReason}
            salonPublicId={salonPublicId}
            onToast={setToast}
          />

          <SalonLinkCard
            username={salon.username}
            salonName={salon.name}
            isApproved={isApproved}
          />

          <section
            id="salon-profile"
            className="scroll-mt-24 rounded-[20px] border border-border bg-surface p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-foreground">
                اطلاعات پایه و تماس
              </h2>
              {profileDirty && (
                <span className="rounded-full bg-warning-background px-2 py-0.5 text-[11px] font-semibold text-warning">
                  تغییرات ذخیره‌نشده
                </span>
              )}
            </div>

            <BasicInfoSection
              values={basicInfo}
              onChange={(next) => {
                if (next.username !== basicInfo.username) setUsernameServerError("");
                setBasicInfo(next);
              }}
              nameError={
                profileSubmitted && !basicInfo.name.trim()
                  ? "نام سالن الزامی است."
                  : undefined
              }
              salonPublicId={salonPublicId as string}
              savedUsername={salon.username}
              usernameError={
                usernameServerError ||
                (profileSubmitted && !basicInfo.username.trim()
                  ? "آدرس اختصاصی سالن الزامی است."
                  : undefined)
              }
              usernameNote={
                isApproved && basicInfo.username.trim() !== (salon.username ?? "")
                  ? "با تغییر آدرس، لینک قبلی همچنان کار می‌کند، ولی تا 30 روز نمی‌توانید دوباره آن را تغییر دهید."
                  : undefined
              }
            />

            <div className="my-4 border-t border-border" />

            <ContactSocialSection values={contactInfo} onChange={setContactInfo} />

            <Button
              type="button"
              className="mt-4 w-full"
              onClick={onSaveBasicContact}
              disabled={saveBasicInfo.isPending}
              isLoading={saveBasicInfo.isPending}
            >
              ذخیره اطلاعات
            </Button>
          </section>

          <MediaSection
            salonPublicId={salonPublicId as string}
            cover={cover}
            banner={banner}
            logo={logo}
            gallery={gallery}
            onCoverChange={setCover}
            onBannerChange={setBanner}
            onLogoChange={setLogo}
            onGalleryChange={setGallery}
          />
          <BranchesSection
            branches={branches}
            onChange={setBranches}
            onSave={onSaveBranches}
            isSaving={saveBranches.isPending}
            isDirty={branchesDirty}
            errors={branchErrors}
          />

          <p className="text-xs text-foreground-muted">
            مدیریت خدمات، پرسنل و برنامه از{" "}
            <Link
              href={RouteAddress.DASHBOARD.CATALOG}
              className="font-semibold text-primary"
            >
              کاتالوگ
            </Link>
            ،{" "}
            <Link
              href={RouteAddress.DASHBOARD.STAFF_SERVICES}
              className="font-semibold text-primary"
            >
              خدمات پرسنل
            </Link>{" "}
            و{" "}
            <Link
              href={RouteAddress.DASHBOARD.SCHEDULES}
              className="font-semibold text-primary"
            >
              برنامه پرسنل
            </Link>{" "}
            انجام می‌شود.
          </p>
        </>
      )}

      <DashboardToast toast={toast} onDismiss={dismissToast} />
    </DashboardPage>
  );
}
