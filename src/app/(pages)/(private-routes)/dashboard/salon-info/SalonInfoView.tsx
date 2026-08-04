"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RouteAddress } from "@/shared/data/routeAddress";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useOnboardingDraftStore } from "@/services/domains/salons/store/useOnboardingDraftStore";
import { useMutateSalonBasicInfo } from "@/services/domains/salons/hooks/useMutateSalonBasicInfo";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import SalonInfoJumpNav, {
  SALON_INFO_SECTIONS,
} from "./components/SalonInfoJumpNav";
import SalonStatusBanner from "./components/SalonStatusBanner";
import SalonInfoToast, {
  type SalonInfoToastState,
} from "./components/SalonInfoToast";
import BasicInfoSection, {
  type BasicInfoValues,
} from "./components/sections/BasicInfoSection";
import ContactSocialSection, {
  type ContactSocialValues,
} from "./components/sections/ContactSocialSection";
import MediaSection from "./components/sections/MediaSection";
import BranchesSection from "./components/sections/BranchesSection";

export default function SalonInfoView() {
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const salonId = useSalonContextStore((s) => s.salonId);
  const branchId = useSalonContextStore((s) => s.branchId);
  const setActiveContext = useSalonContextStore((s) => s.setActiveContext);
  const draftSalonPublicId = useOnboardingDraftStore((s) => s.salonPublicId);
  const draftSubmitted = useOnboardingDraftStore((s) => s.submitted);
  const draftStep = useOnboardingDraftStore((s) => s.step);
  const setDraftBasicInfo = useOnboardingDraftStore((s) => s.setBasicInfo);

  const saveBasicInfo = useMutateSalonBasicInfo();

  const isIncompleteDraft =
    !!salonPublicId &&
    draftSalonPublicId === salonPublicId &&
    !draftSubmitted &&
    draftStep < 7;

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
  const [toast, setToast] = useState<SalonInfoToastState>(null);

  const dismissToast = useCallback(() => setToast(null), []);

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
  }, []);

  const onJump = (id: string) => {
    setActiveSectionId(id);
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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

  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-col gap-4 px-safe-area pb-8">
      <SalonInfoJumpNav activeId={activeSectionId} onJump={onJump} />

      <div className="rounded-lg bg-surface-secondary p-3">
        <h1 className="text-base font-bold text-foreground">اطلاعات سالن</h1>
        <p className="mt-1 text-xs text-foreground-muted">
          ویرایش اطلاعات پایه، تماس، رسانه و شعبه‌ها برای سالن فعال.
        </p>
      </div>

      <SalonStatusBanner show={isIncompleteDraft} />

      <BasicInfoSection values={basicInfo} onChange={setBasicInfo} />
      <ContactSocialSection
        values={contactInfo}
        onChange={setContactInfo}
        onSave={onSaveBasicContact}
        isSaving={saveBasicInfo.isPending}
        canSave={!!salonPublicId && basicInfo.name.trim().length > 0}
      />
      <MediaSection />
      <BranchesSection />

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

      <SalonInfoToast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
