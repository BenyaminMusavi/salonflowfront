"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { RouteAddress } from "@/shared/data/routeAddress";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useOnboardingDraftStore } from "@/services/domains/salons/store/useOnboardingDraftStore";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { useMutateSalonBasicInfo } from "@/services/domains/salons/hooks/useMutateSalonBasicInfo";
import { useMutateSalonBranches } from "@/services/domains/salons/hooks/useMutateSalonBranches";
import { useMutateSalonMedia } from "@/services/domains/salons/hooks/useMutateSalonMedia";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import type { IOnboardingBranch } from "@/services/domains/salons/types/onboarding.type";
import SalonInfoJumpNav, {
  SALON_INFO_SECTIONS,
} from "./components/SalonInfoJumpNav";
import SalonStatusBanner from "./components/SalonStatusBanner";
import SalonInfoToast, {
  type SalonInfoToastState,
} from "./components/SalonInfoToast";
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
  type BranchEditorValues,
} from "./components/sections/BranchEditorItem";
import {
  collectHydratedMediaPublicIds,
  mapSalonToBasicInfo,
  mapSalonToBranches,
  mapSalonToContactInfo,
  mapSalonToCover,
  mapSalonToGallery,
  mapSalonToProfile,
} from "./utils/mapSalonToForm";

function toOnboardingBranches(
  branches: BranchEditorValues[]
): IOnboardingBranch[] {
  return branches.map((b) => ({
    publicId: b.publicId,
    name: b.name.trim(),
    city: b.city.trim(),
    address: b.address.trim(),
    latitude: null,
    longitude: null,
    genderType: b.genderType,
    phone: b.phone.trim() || null,
  }));
}

function collectKeepMediaPublicIds(
  cover: MediaSlotState,
  profile: MediaSlotState,
  gallery: GalleryMediaItem[]
): string[] {
  const ids: string[] = [];
  if (cover.publicId && !cover.file) ids.push(cover.publicId);
  if (profile.publicId && !profile.file) ids.push(profile.publicId);
  for (const item of gallery) {
    if (item.publicId && !item.file) ids.push(item.publicId);
  }
  return Array.from(new Set(ids));
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

  const salonQuery = useQuerySalonById(salonPublicId || undefined);
  const salon = salonQuery.data?.data;

  const saveBasicInfo = useMutateSalonBasicInfo();
  const saveBranches = useMutateSalonBranches();
  const saveMedia = useMutateSalonMedia();

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
    description: "",
  });
  const [contactInfo, setContactInfo] = useState<ContactSocialValues>({
    instagramHandle: "",
    whatsappNumber: "",
    websiteUrl: "",
  });
  const [branches, setBranches] = useState<BranchEditorValues[]>([
    createEmptyBranch(),
  ]);
  const [cover, setCover] = useState<MediaSlotState>(createEmptyMediaSlot);
  const [profile, setProfile] = useState<MediaSlotState>(createEmptyMediaSlot);
  const [gallery, setGallery] = useState<GalleryMediaItem[]>([]);
  const [initialMediaPublicIds, setInitialMediaPublicIds] = useState<string[]>(
    []
  );
  const [toast, setToast] = useState<SalonInfoToastState>(null);

  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    hydratedForIdRef.current = null;
  }, [salonPublicId]);

  useEffect(() => {
    if (!salonPublicId || !salon) return;
    if (hydratedForIdRef.current === salonPublicId) return;

    const nextCover = mapSalonToCover(salon);
    const nextProfile = mapSalonToProfile(salon);
    const nextGallery = mapSalonToGallery(salon);

    setBasicInfo(mapSalonToBasicInfo(salon));
    setContactInfo(mapSalonToContactInfo(salon));
    setCover(nextCover);
    setProfile(nextProfile);
    setGallery(nextGallery);
    setBranches(mapSalonToBranches(salon));
    setInitialMediaPublicIds(
      collectHydratedMediaPublicIds(nextCover, nextProfile, nextGallery)
    );
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

  const onJump = (id: string) => {
    setActiveSectionId(id);
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const onRetryLoad = () => {
    hydratedForIdRef.current = null;
    void salonQuery.refetch();
  };

  const onSaveBasicContact = async () => {
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

    try {
      await saveBasicInfo.mutateAsync({
        publicId: salonPublicId,
        name,
        description: basicInfo.description.trim() || null,
        instagramHandle: contactInfo.instagramHandle.trim() || null,
        whatsappNumber: contactInfo.whatsappNumber.trim() || null,
        websiteUrl: contactInfo.websiteUrl.trim() || null,
      });

      setDraftBasicInfo({
        name,
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

      setToast({ type: "success", message: "اطلاعات سالن با موفقیت ذخیره شد." });
    } catch (err) {
      setToast({
        type: "error",
        message: getApiErrorMessage(err, "ذخیره اطلاعات سالن ناموفق بود."),
      });
    }
  };

  const onSaveBranches = async () => {
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

    const payload = toOnboardingBranches(branches);

    try {
      await saveBranches.mutateAsync({
        salonPublicId,
        branches: payload,
      });
      setDraftBranches(payload);
      setToast({ type: "success", message: "شعبه‌ها با موفقیت ذخیره شدند." });
    } catch (err) {
      setToast({
        type: "error",
        message: getApiErrorMessage(err, "ذخیره شعبه‌ها ناموفق بود."),
      });
    }
  };

  const keepMediaPublicIds = collectKeepMediaPublicIds(cover, profile, gallery);
  const hasPendingMediaUploads = !!(
    cover.file ||
    profile.file ||
    gallery.some((g) => g.file)
  );
  const hasMediaRemovals = initialMediaPublicIds.some(
    (id) => !keepMediaPublicIds.includes(id)
  );
  const canSaveMedia =
    !!salonPublicId && (hasPendingMediaUploads || hasMediaRemovals);

  const onSaveMedia = async () => {
    if (!salonPublicId) {
      setToast({
        type: "error",
        message: "شناسه سالن فعال پیدا نشد. دوباره وارد پنل شوید.",
      });
      return;
    }
    if (!canSaveMedia) {
      setToast({
        type: "error",
        message: "تغییری برای ذخیره رسانه وجود ندارد.",
      });
      return;
    }

    try {
      const result = await saveMedia.mutateAsync({
        salonPublicId,
        coverFile: cover.file,
        profileFile: profile.file,
        galleryFiles: gallery.filter((g) => g.file).map((g) => g.file!),
        keepMediaPublicIds,
      });

      setCover((prev) => ({
        ...prev,
        file: null,
        fileName: null,
      }));
      setProfile((prev) => ({
        ...prev,
        file: null,
        fileName: null,
      }));
      setGallery((prev) =>
        prev.map((item) => ({
          ...item,
          file: null,
        }))
      );
      setInitialMediaPublicIds(result.keepMediaPublicIds);

      setToast({ type: "success", message: "رسانه سالن با موفقیت ذخیره شد." });
    } catch (err) {
      setToast({
        type: "error",
        message: getApiErrorMessage(err, "ذخیره رسانه ناموفق بود."),
      });
    }
  };

  const showLoading = !!salonPublicId && salonQuery.isLoading && !salon;
  const showError =
    !!salonPublicId &&
    !salonQuery.isLoading &&
    (salonQuery.isError || !salon);
  const showMissingContext = !salonPublicId;

  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-col gap-4 px-safe-area pb-8">
      <SalonInfoJumpNav activeId={activeSectionId} onJump={onJump} />

      <div className="rounded-lg bg-surface-secondary p-3">
        <h1 className="text-base font-bold text-foreground">اطلاعات سالن</h1>
        <p className="mt-1 text-xs text-foreground-muted">
          ویرایش اطلاعات پایه، تماس، رسانه و شعبه‌ها برای سالن فعال.
        </p>
      </div>

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
          <SalonStatusBanner show={isIncompleteDraft} />

          <BasicInfoSection values={basicInfo} onChange={setBasicInfo} />
          <ContactSocialSection
            values={contactInfo}
            onChange={setContactInfo}
            onSave={onSaveBasicContact}
            isSaving={saveBasicInfo.isPending}
            canSave={!!salonPublicId && basicInfo.name.trim().length > 0}
          />
          <MediaSection
            cover={cover}
            profile={profile}
            gallery={gallery}
            onCoverChange={setCover}
            onProfileChange={setProfile}
            onGalleryChange={setGallery}
            onSave={onSaveMedia}
            isSaving={saveMedia.isPending}
            canSave={canSaveMedia}
          />
          <BranchesSection
            branches={branches}
            onChange={setBranches}
            onSave={onSaveBranches}
            isSaving={saveBranches.isPending}
            canSave={
              !!salonPublicId &&
              branches.length > 0 &&
              branches.every(
                (b) => b.name.trim() && b.city.trim() && b.address.trim()
              )
            }
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

      <SalonInfoToast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
