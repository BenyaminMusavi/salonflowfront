"use client";

import { IBranchService } from "@/services/domains/salons/types/booking-browse.type";
import { ICalculatePriceResult } from "@/services/domains/salons/types/booking-browse.type";
import { formatToman } from "@/shared/utils/salonDisplay";

function formatFaDate(date: string) {
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString("fa-IR", {
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
  price?: ICalculatePriceResult | null;
  notes: string;
  onNotesChange: (value: string) => void;
  isLoggedIn: boolean;
}

function ReviewRow({ label, value }: { label: string; value: string }) {
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
  price,
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
          label="خدمات"
          value={
            services.length > 0
              ? services.map((s) => s.name).join("، ")
              : "—"
          }
        />
        <ReviewRow
          label="تاریخ"
          value={date ? formatFaDate(date) : "—"}
        />
        <ReviewRow label="ساعت" value={timeLabel} />
        <ReviewRow label="پرسنل" value={staffLabel || "—"} />
      </div>

      {price ? (
        <div className="rounded-[24px] bg-surface p-5">
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
