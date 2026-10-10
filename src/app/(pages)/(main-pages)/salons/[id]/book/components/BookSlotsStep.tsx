"use client";

import { ISalonBrowseSlot } from "@/services/domains/salons/types/booking-browse.type";
import { cn } from "@/shared/utils/className";

function formatSlotTime(time: string) {
  return time.length >= 5 ? time.slice(0, 5) : time;
}

/** Screen readers get the full range; the button itself shows only the start time. */
function slotAriaLabel(slot: ISalonBrowseSlot) {
  const start = formatSlotTime(slot.time);
  const end = slot.endTime ? formatSlotTime(slot.endTime) : null;
  return end ? `از ${start} تا ${end}` : start;
}

/** One button per start time — with several people free at once the API repeats a time. */
function uniqueByStart(slots: ISalonBrowseSlot[]) {
  const seen = new Set<string>();
  return slots.filter((s) => (seen.has(s.time) ? false : (seen.add(s.time), true)));
}

interface BookSlotsStepProps {
  slots: ISalonBrowseSlot[];
  selectedTime: string | null;
  isLoading?: boolean;
  isError?: boolean;
  onSelect: (slot: ISalonBrowseSlot) => void;
  onChangeDate?: () => void;
  onChangeStaff?: () => void;
  onRetry?: () => void;
}

export default function BookSlotsStep({
  slots,
  selectedTime,
  isLoading = false,
  isError = false,
  onSelect,
  onChangeDate,
  onChangeStaff,
  onRetry,
}: BookSlotsStepProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-bold text-foreground">انتخاب ساعت</h2>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-2xl bg-surface"
            />
          ))}
        </div>
      ) : null}

      {!isLoading && isError ? (
        <div className="rounded-[24px] bg-error/10 px-4 py-8 text-center">
          <p className="text-base font-bold text-foreground">
            دریافت ساعت‌های خالی ناموفق بود
          </p>
          <p className="mt-2 text-sm text-foreground-muted">
            مشکلی در ارتباط با سرور پیش آمد. دوباره تلاش کنید.
          </p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-5 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
            >
              تلاش دوباره
            </button>
          ) : null}
        </div>
      ) : null}

      {!isLoading && !isError && slots.length === 0 ? (
        <div className="rounded-[24px] bg-surface px-4 py-8 text-center">
          <p className="text-base font-bold text-foreground">
            ظرفیتی برای این انتخاب نیست
          </p>
          <p className="mt-2 text-sm text-foreground-muted">
            تاریخ یا پرسنل دیگری را امتحان کنید.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            {onChangeDate ? (
              <button
                type="button"
                onClick={onChangeDate}
                className="rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground"
              >
                تغییر تاریخ
              </button>
            ) : null}
            {onChangeStaff ? (
              <button
                type="button"
                onClick={onChangeStaff}
                className="rounded-full border border-border py-3 text-sm font-bold text-foreground"
              >
                تغییر پرسنل
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {!isLoading && slots.length > 0 ? (
        <div className="grid grid-cols-4 gap-2">
          {uniqueByStart(slots).map((slot) => {
            const selected = selectedTime === slot.time;
            return (
              <button
                key={slot.time}
                type="button"
                onClick={() => onSelect(slot)}
                aria-label={slotAriaLabel(slot)}
                aria-pressed={selected}
                className={cn(
                  "rounded-2xl px-1 py-3 text-sm font-semibold tabular-nums transition",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-foreground hover:bg-surface-hover"
                )}
              >
                {formatSlotTime(slot.time)}
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
