"use client";

import { addDaysYmd, formatSalonDate, salonTodayYmd, ymdToDate } from "@/shared/utils/salonTime";
import { cn } from "@/shared/utils/className";
import { DashboardDateField } from "../_components/DashboardDateField";

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 07–22
const MINUTES = [0, 15, 30, 45];
export const pad2 = (n: number) => String(n).padStart(2, "0");

/** «پنج‌شنبه 9 مهر» */
export function dayLabel(ymd: string): string {
  try {
    return formatSalonDate(ymdToDate(ymd), { weekday: "long", day: "numeric", month: "long" });
  } catch {
    return ymd;
  }
}

export const pickerChip = (active: boolean) =>
  cn(
    "shrink-0 rounded-full px-2 py-1.5 text-xs font-semibold tabular-nums transition-colors",
    active ? "bg-primary text-primary-foreground" : "bg-surface-hover text-foreground-muted"
  );

/** Today / tomorrow chips plus a Jalali date field for any other day. */
export function DayPicker({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (ymd: string) => void;
}) {
  const today = salonTodayYmd();
  const tomorrow = addDaysYmd(today, 1);
  return (
    <section className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-foreground-muted">روز</p>
      <div className="flex gap-2">
        <button type="button" className={pickerChip(value === today)} onClick={() => onChange(today)}>
          امروز
        </button>
        <button type="button" className={pickerChip(value === tomorrow)} onClick={() => onChange(tomorrow)}>
          فردا
        </button>
      </div>
      <DashboardDateField name={name} value={value} onChange={(d) => d && onChange(d)} />
    </section>
  );
}

/** Salon-clock time in 15-minute steps: an hour grid plus a minutes segment. */
export function TimePicker({
  hour,
  minute,
  onChange,
}: {
  hour: number;
  minute: number;
  onChange: (hour: number, minute: number) => void;
}) {
  return (
    <section className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-foreground-muted">ساعت</p>
      <div className="grid grid-cols-8 gap-1.5">
        {HOURS.map((h) => (
          <button key={h} type="button" className={pickerChip(h === hour)} onClick={() => onChange(h, minute)}>
            {pad2(h)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-1 rounded-full bg-surface-hover p-1">
        {MINUTES.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChange(hour, m)}
            className={cn(
              "rounded-full py-1.5 text-xs font-semibold tabular-nums",
              m === minute ? "bg-primary text-primary-foreground" : "text-foreground-muted"
            )}
          >
            {pad2(m)}
          </button>
        ))}
      </div>
    </section>
  );
}

/** Rounds to the 15-minute grid the pickers offer. */
export function snapMinute(minute: number): number {
  return MINUTES.includes(minute) ? minute : Math.min(45, Math.round(minute / 15) * 15);
}
