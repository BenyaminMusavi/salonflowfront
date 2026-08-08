"use client";

import Link from "next/link";
import { ICalculatePriceResult } from "@/services/domains/salons/types/booking-browse.type";
import { formatToman } from "@/shared/utils/salonDisplay";
import { RouteAddress } from "@/shared/data/routeAddress";

interface BookPriceStepProps {
  price?: ICalculatePriceResult | null;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export default function BookPriceStep({
  price,
  isLoading = false,
  isError = false,
  onRetry,
}: BookPriceStepProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-bold text-foreground">پیش‌فاکتور</h2>

      {isLoading ? (
        <div className="space-y-3 rounded-[24px] bg-surface p-5">
          <div className="h-4 w-2/3 animate-pulse rounded bg-surface-hover" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-surface-hover" />
          <div className="my-2 h-px bg-border" />
          <div className="h-16 animate-pulse rounded-2xl bg-surface-hover" />
        </div>
      ) : null}

      {!isLoading && isError ? (
        <div className="rounded-[24px] bg-surface px-4 py-6 text-center">
          <p className="text-sm text-error">محاسبه قیمت ناموفق بود.</p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
            >
              تلاش مجدد
            </button>
          ) : null}
        </div>
      ) : null}

      {!isLoading && !isError && price ? (
        <div className="rounded-[24px] bg-surface p-5">
          <ul className="flex flex-col gap-2.5">
            {price.services.map((line) => (
              <li
                key={line.serviceTypePublicId || line.serviceTypeId || line.serviceName}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-foreground">{line.serviceName}</span>
                <span className="shrink-0 font-bold text-foreground">
                  {formatToman(line.price)}
                </span>
              </li>
            ))}
          </ul>

          <div className="my-4 h-px bg-border" />

          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground-muted">جمع کل</span>
            <span className="font-bold text-foreground">
              {formatToman(price.totalPrice)} تومان
            </span>
          </div>

          <div className="mt-3 rounded-2xl bg-primary/10 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-foreground">
                بیعانه الان
              </span>
              <span className="text-base font-bold text-primary">
                {formatToman(price.amountDueNow)} تومان
              </span>
            </div>
            <p className="mt-1 text-[11px] text-foreground-muted">
              پرداخت بیعانه از کیف پول انجام می‌شود
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-foreground-muted">باقی‌مانده در سالن</span>
            <span className="font-bold text-foreground">
              {formatToman(price.remainingAfterDeposit)} تومان
            </span>
          </div>

          <p className="mt-3 text-xs text-foreground-muted">
            لغو رایگان تا{" "}
            {price.freeCancellationWindowHours.toLocaleString("fa-IR")} ساعت
            قبل از نوبت
          </p>

          {price.amountDueNow > 0 ? (
            <Link
              href={RouteAddress.WALLET.BASE}
              className="mt-3 inline-block text-xs font-medium text-primary"
            >
              مشاهده کیف پول
            </Link>
          ) : null}
        </div>
      ) : null}

      {!isLoading && !isError && !price ? (
        <div className="rounded-[24px] bg-surface px-4 py-6 text-center">
          <p className="text-sm text-foreground-muted">
            پیش‌فاکتوری برای نمایش وجود ندارد.
          </p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 text-sm font-medium text-primary"
            >
              تلاش مجدد
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
