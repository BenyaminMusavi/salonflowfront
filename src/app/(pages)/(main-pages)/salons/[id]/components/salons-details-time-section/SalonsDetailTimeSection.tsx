"use client";

import { cn } from "@/shared/utils/className";

interface TimeSectionProps {
  selectedTime: string;
  onSelectTime: (time: string) => void;
}

const times = [
  "۰۹:۰۰",
  "۱۰:۰۰",
  "۱۱:۰۰",
  "۱۲:۰۰",
  "۱۳:۰۰",
  "۱۴:۰۰",
  "۱۵:۰۰",
  "۱۶:۰۰",
  "۱۷:۰۰",
  "۱۸:۰۰",
];

export default function SalonsDetailTimeSection({
  selectedTime,
  onSelectTime,
}: TimeSectionProps) {
  return (
    <div className="px-safe-area mt-6">
      <h2 className="mb-3 text-lg font-bold text-foreground">ساعت</h2>
      <div className="flex flex-wrap gap-3">
        {times.map((time) => {
          const isActive = selectedTime === time;
          return (
            <button
              key={time}
              type="button"
              onClick={() => onSelectTime(time)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-tertiary text-foreground",
              )}
            >
              {time}
            </button>
          );
        })}
      </div>
    </div>
  );
}
