"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RouteAddress } from "@/shared/data/routeAddress";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useOnboardingDraftStore } from "@/services/domains/salons/store/useOnboardingDraftStore";
import SalonInfoJumpNav, {
  SALON_INFO_SECTIONS,
} from "./components/SalonInfoJumpNav";
import SalonStatusBanner from "./components/SalonStatusBanner";
import BasicInfoSection from "./components/sections/BasicInfoSection";
import ContactSocialSection from "./components/sections/ContactSocialSection";
import MediaSection from "./components/sections/MediaSection";
import BranchesSection from "./components/sections/BranchesSection";

export default function SalonInfoView() {
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const draftSalonPublicId = useOnboardingDraftStore((s) => s.salonPublicId);
  const draftSubmitted = useOnboardingDraftStore((s) => s.submitted);
  const draftStep = useOnboardingDraftStore((s) => s.step);

  const isIncompleteDraft =
    !!salonPublicId &&
    draftSalonPublicId === salonPublicId &&
    !draftSubmitted &&
    draftStep < 7;

  const [activeSectionId, setActiveSectionId] = useState<string>(
    SALON_INFO_SECTIONS[0].id
  );

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

      <BasicInfoSection />
      <ContactSocialSection />
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
    </div>
  );
}
