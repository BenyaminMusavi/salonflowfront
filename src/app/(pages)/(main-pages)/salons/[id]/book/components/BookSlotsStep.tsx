"use client";

import { ISalonBrowseSlot } from "@/services/domains/salons/types/booking-browse.type";
import { cn } from "@/shared/utils/className";

function formatSlotLabel(time: string) {
  return time.length >= 5 ? time.slice(0, 5) : time;
}

interface BookSlotsStepProps {
  slots: ISalonBrowseSlot[];
  selectedTime: string | null;
  isLoading?: boolean;
  onSelect: (slot: ISalonBrowseSlot) => void;
  onChangeDate?: () => void;
  onChangeStaff?: () => void;
}

export default function BookSlotsStep({
  slots,
  selectedTime,
  isLoading = false,
  onSelect,
  onChangeDate,
  onChangeStaff,
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

      {!isLoading && slots.length === 0 ? (
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
        <div className="grid grid-cols-3 gap-2">
          {slots.map((slot) => {
            const label = formatSlotLabel(slot.time);
            const selected = selectedTime === slot.time;
            return (
              <button
                key={`${slot.time}-${slot.endTime}`}
                type="button"
                onClick={() => onSelect(slot)}
                className={cn(
                  "rounded-2xl py-3 text-sm font-medium transition",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-foreground hover:bg-surface-hover"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
