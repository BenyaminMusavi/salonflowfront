"use client";

import { IAvailableDate } from "@/services/domains/salons/types/booking-browse.type";
import { cn } from "@/shared/utils/className";

function parseFaParts(date: string) {
  try {
    const d = new Date(`${date}T12:00:00`);
    return {
      weekday: d.toLocaleDateString("fa-IR", { weekday: "short" }),
      day: d.toLocaleDateString("fa-IR", { day: "numeric" }),
      month: d.toLocaleDateString("fa-IR", { month: "short" }),
    };
  } catch {
    return { weekday: "—", day: date, month: "" };
  }
}

interface BookDateStepProps {
  dates: IAvailableDate[];
  selectedDate: string | null;
  isLoading?: boolean;
  onSelect: (date: string) => void;
  onChangeServices?: () => void;
}

export default function BookDateStep({
  dates,
  selectedDate,
  isLoading = false,
  onSelect,
  onChangeServices,
}: BookDateStepProps) {
  const available = dates.filter((d) => d.isAvailable);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-bold text-foreground">انتخاب تاریخ</h2>

      {isLoading ? (
        <div className="no-scrollbar -mx-safe-area flex gap-2 overflow-x-auto px-safe-area">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-[84px] w-[68px] shrink-0 animate-pulse rounded-2xl bg-surface"
            />
          ))}
        </div>
      ) : null}

      {!isLoading && available.length === 0 ? (
        <div className="rounded-2xl bg-surface px-4 py-6 text-center">
          <p className="text-sm text-foreground-muted">
            روزی با ظرفیت آزاد پیدا نشد.
          </p>
          {onChangeServices ? (
            <button
              type="button"
              onClick={onChangeServices}
              className="mt-3 text-sm font-medium text-primary"
            >
              تغییر خدمات
            </button>
          ) : null}
        </div>
      ) : null}

      {!isLoading && available.length > 0 ? (
        <div className="no-scrollbar -mx-safe-area flex snap-x snap-mandatory gap-2 overflow-x-auto px-safe-area pb-1">
          {available.map((d) => {
            const parts = parseFaParts(d.date);
            const selected = selectedDate === d.date;
            return (
              <button
                key={d.date}
                type="button"
                onClick={() => onSelect(d.date)}
                className={cn(
                  "flex w-[68px] shrink-0 snap-start flex-col items-center gap-1 rounded-2xl px-2 py-3 transition",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-foreground hover:bg-surface-hover"
                )}
              >
                <span
                  className={cn(
                    "text-[11px]",
                    selected
                      ? "text-primary-foreground/80"
                      : "text-foreground-muted"
                  )}
                >
                  {parts.weekday}
                </span>
                <span className="text-lg font-bold leading-none">
                  {parts.day}
                </span>
                <span
                  className={cn(
                    "text-[11px]",
                    selected
                      ? "text-primary-foreground/80"
                      : "text-foreground-muted"
                  )}
                >
                  {parts.month}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
