"use client";

import Link from "next/link";
import { LockSimpleIcon } from "@phosphor-icons/react";
import { RouteAddress } from "@/shared/data/routeAddress";
import { SUBSCRIPTION_OWNER_LOCK_MESSAGE } from "@/services/domains/booking/utils/booking-mappers";

interface SubscriptionLockBannerProps {
  className?: string;
}

export default function SubscriptionLockBanner({
  className,
}: SubscriptionLockBannerProps) {
  return (
    <div
      className={
        className ??
        "mx-auto mt-3 w-full max-w-[720px] px-safe-area"
      }
    >
      <div className="rounded-[20px] border border-error/30 bg-error/10 p-4">
        <div className="flex items-start gap-2">
          <LockSimpleIcon
            size={18}
            className="mt-0.5 shrink-0 text-error"
            weight="bold"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              اشتراک سالن قفل است
            </p>
            <p className="mt-1 text-xs text-foreground-muted">
              {SUBSCRIPTION_OWNER_LOCK_MESSAGE} ثبت نوبت جدید ممکن نیست؛ لغو و
              تکمیل نوبت‌های قبلی باز است.
            </p>
            <Link
              href={RouteAddress.SUBSCRIPTIONS.BASE}
              className="mt-3 inline-flex h-9 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground"
            >
              شروع آزمایش رایگان / خرید اشتراک
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
