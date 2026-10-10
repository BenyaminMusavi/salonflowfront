"use client";

import { IBranchService } from "@/services/domains/salons/types/booking-browse.type";
import { ICalculatePriceResult } from "@/services/domains/salons/types/booking-browse.type";
import { formatToman } from "@/shared/utils/salonDisplay";
import { APP_LOCALE } from "@/shared/utils/locale";
import { formatSalonDate, ymdToDate } from "@/shared/utils/salonTime";

function formatFaDate(date: string) {
  try {
    return formatSalonDate(ymdToDate(date), {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  } catch {
    return date;
  }
}

function formatTime(time: string) {
  return time.length >= 5 ? time.slice(0, 5) : time;
}

interface BookConfirmStepProps {
  salonName: string;
  branchName: string;
  services: IBranchService[];
  date: string | null;
  slotTime: string | null;
  slotEndTime: string | null;
  staffLabel: string;
  /** Small tag next to the staff name, e.g. «اولین نوبت». */
  staffTag?: string | null;
  price?: ICalculatePriceResult | null;
  priceLoading?: boolean;
  priceError?: boolean;
  onRetryPrice?: () => void;
  notes: string;
  onNotesChange: (value: string) => void;
  isLoggedIn: boolean;
}

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="shrink-0 text-sm text-foreground-muted">{label}</span>
      <span className="text-left text-sm font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

export default function BookConfirmStep({
  salonName,
  branchName,
  services,
  date,
  slotTime,
  slotEndTime,
  staffLabel,
  staffTag,
  price,
  priceLoading = false,
  priceError = false,
  onRetryPrice,
  notes,
  onNotesChange,
  isLoggedIn,
}: BookConfirmStepProps) {
  const timeLabel =
    slotTime != null
      ? `${formatTime(slotTime)}${
          slotEndTime ? ` تا ${formatTime(slotEndTime)}` : ""
        }`
      : "—";

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-base font-bold text-foreground">تأیید رزرو</h2>

      <div className="rounded-[24px] bg-surface px-4 py-2 divide-y divide-border">
        <ReviewRow label="سالن" value={salonName} />
        <ReviewRow label="شعبه" value={branchName || "—"} />
        <ReviewRow
          label="تاریخ"
          value={date ? formatFaDate(date) : "—"}
        />
        <ReviewRow label="ساعت" value={timeLabel} />
        <ReviewRow
          label="پرسنل"
          value={
            <span className="inline-flex flex-wrap items-center justify-end gap-1.5">
              {staffTag ? (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {staffTag}
                </span>
              ) : null}
              <span>{staffLabel || "—"}</span>
            </span>
          }
        />
      </div>

      {priceLoading ? (
        <div className="space-y-3 rounded-[24px] bg-surface p-5">
          <div className="h-4 w-2/3 animate-pulse rounded bg-surface-hover" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-surface-hover" />
          <div className="h-10 animate-pulse rounded-2xl bg-surface-hover" />
        </div>
      ) : priceError ? (
        <div className="rounded-[24px] bg-surface px-4 py-6 text-center">
          <p className="text-sm text-error">محاسبه‌ی قیمت ناموفق بود.</p>
          {onRetryPrice ? (
            <button
              type="button"
              onClick={onRetryPrice}
              className="mt-3 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
            >
              تلاش مجدد
            </button>
          ) : null}
        </div>
      ) : price ? (
        <div className="rounded-[24px] bg-surface p-5">
          <ul className="flex flex-col gap-2.5">
            {(price.services.length ? price.services : services.map((s) => ({ serviceTypePublicId: s.servicePublicId, serviceName: s.name, price: s.price }))).map((line) => (
              <li key={line.serviceTypePublicId || line.serviceName} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-foreground">{line.serviceName}</span>
                <span className="shrink-0 font-semibold text-foreground">{formatToman(line.price)} تومان</span>
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
          {price.amountDueNow > 0 ? (
            <div className="mt-3 rounded-2xl bg-primary/10 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-foreground">
                  بیعانه الان
                </span>
                <span className="text-base font-bold text-primary">
                  {formatToman(price.amountDueNow)} تومان
                </span>
              </div>
            </div>
          ) : price.totalDepositAmount > 0 ? (
            <p className="mt-3 text-xs text-foreground-muted">
              بیعانه‌ی {formatToman(price.totalDepositAmount)} تومان در سالن پرداخت می‌شود.
            </p>
          ) : null}
          {price.totalDepositAmount > 0 || price.amountDueNow > 0 ? (
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-foreground-muted">باقی‌مانده در سالن</span>
              <span className="font-bold text-foreground">
                {formatToman(price.remainingAfterDeposit)} تومان
              </span>
            </div>
          ) : null}
          <p className="mt-3 text-xs text-foreground-muted">
            لغو رایگان تا{" "}
            {price.freeCancellationWindowHours.toLocaleString(APP_LOCALE)} ساعت
            قبل از نوبت
          </p>
        </div>
      ) : null}

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-foreground-muted">یادداشت (اختیاری)</span>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={3}
          className="rounded-2xl border border-input-border bg-input px-4 py-3 text-foreground outline-none placeholder:text-input-placeholder"
          placeholder="توضیحات برای سالن…"
        />
      </label>

      {!isLoggedIn ? (
        <p className="text-xs text-foreground-muted">
          برای ثبت نهایی باید وارد حساب کاربری شوید.
        </p>
      ) : null}
    </section>
  );
}
