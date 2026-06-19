"use client";

import { cn } from "@/shared/utils/className";

interface DateSectionProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const dates = [
  { day: "۱۹", weekday: "پنج", full: "2026-06-19" },
  { day: "۲۰", weekday: "جم", full: "2026-06-20" },
  { day: "۲۱", weekday: "شن", full: "2026-06-21" },
  { day: "۲۲", weekday: "یک", full: "2026-06-22" },
  { day: "۲۳", weekday: "دو", full: "2026-06-23" },
  { day: "۲۴", weekday: "سه", full: "2026-06-24" },
];

export default function SalonsDetailDateSection({
  selectedDate,
  onSelectDate,
}: DateSectionProps) {
  return (
    <div className="px-safe-area mt-6">
      <h2 className="mb-3 text-lg font-bold text-foreground">تاریخ</h2>
      <div className="no-scrollbar flex gap-3 overflow-x-auto">
        {dates.map((date) => {
          const isActive = selectedDate === date.full;
          return (
            <button
              key={date.full}
              type="button"
              onClick={() => onSelectDate(date.full)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-5 py-3 transition-colors",
                isActive ? "bg-primary" : "bg-surface-tertiary",
              )}
            >
              <span
                className={cn(
                  "text-base font-bold",
                  isActive ? "text-primary-foreground" : "text-foreground",
                )}
              >
                {date.day}
              </span>
              <span
                className={cn(
                  "text-xs",
                  isActive ? "text-primary-foreground" : "text-foreground-muted",
                )}
              >
                {date.weekday}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
