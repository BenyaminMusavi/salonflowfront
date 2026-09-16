"use client";

import Link from "next/link";
import { ArrowLeftIcon, StorefrontIcon } from "@phosphor-icons/react";
import { useOnboardingDraftStore } from "@/services/domains/salons/store/useOnboardingDraftStore";
import { RouteAddress } from "@/shared/data/routeAddress";

/** Shown when this browser has an in-progress (not yet submitted) salon onboarding draft. */
export default function IncompleteDraftBanner() {
  const salonPublicId = useOnboardingDraftStore((s) => s.salonPublicId);
  const submitted = useOnboardingDraftStore((s) => s.submitted);

  if (!salonPublicId || submitted) return null;

  return (
    <div className="px-safe-area">
      <Link
        href={RouteAddress.ONBOARDING.BASE}
        className="flex items-center gap-3 rounded-[16px] bg-primary/10 p-4 text-right"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
          <StorefrontIcon size={20} className="text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-bold text-foreground">
            یک سالن نصفه‌تمام دارید
          </p>
          <p className="text-[12px] text-foreground-muted">
            برای تکمیل ثبت‌نام سالن ضربه بزنید
          </p>
        </div>
        <ArrowLeftIcon size={18} className="text-foreground-muted" />
      </Link>
    </div>
  );
}
