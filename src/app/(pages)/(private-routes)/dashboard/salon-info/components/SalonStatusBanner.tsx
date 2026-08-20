"use client";

import Link from "next/link";
import { RouteAddress } from "@/shared/data/routeAddress";

interface SalonStatusBannerProps {
  show: boolean;
}

export default function SalonStatusBanner({ show }: SalonStatusBannerProps) {
  if (!show) return null;

  return (
    <div className="rounded-[20px] border border-primary/30 bg-primary/10 p-4">
      <p className="text-sm font-semibold text-foreground">
        ثبت‌نام سالن ناقص است
      </p>
      <p className="mt-1 text-xs text-foreground-muted">
        برای تکمیل مراحل باقی‌مانده (خدمات، پرسنل، برنامه و ارسال بررسی) به
        ویزارد ثبت سالن بروید.
      </p>
      <Link
        href={RouteAddress.ONBOARDING.BASE}
        className="mt-3 inline-flex h-9 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground"
      >
        تکمیل ثبت‌نام سالن
      </Link>
    </div>
  );
}
