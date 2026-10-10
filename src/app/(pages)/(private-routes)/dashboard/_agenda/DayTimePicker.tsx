"use client";

import { useState } from "react";
import { addDaysYmd, salonTodayYmd } from "@/shared/utils/salonTime";
import { cn } from "@/shared/utils/className";
import { DateField } from "@/shared/components/composites/date-picker/DateField";
import { MonthCalendar, dayLabel } from "@/shared/components/composites/date-picker/MonthCalendar";

export { dayLabel };

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 07–22
const MINUTES = [0, 15, 30, 45];
export const pad2 = (n: number) => String(n).padStart(2, "0");

export const pickerChip = (active: boolean) =>
  cn(
    "shrink-0 rounded-full px-2 py-1.5 text-xs font-semibold tabular-nums transition-colors",
    active ? "bg-primary text-primary-foreground" : "bg-surface-hover text-foreground-muted"
  );

/** How far ahead the calendar lets the salon book (months). */
const MAX_MONTHS_AHEAD = 12;

/** Last bookable day, roughly a year ahead. */
const lastBookableDay = () => addDaysYmd(salonTodayYmd(), MAX_MONTHS_AHEAD * 30);

/** A labelled date field (today or later) that opens the shared in-place calendar below itself. */
export function InlineDateField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (ymd: string) => void;
  placeholder?: string;
}) {
  return (
    <DateField
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={salonTodayYmd()}
      max={lastBookableDay()}
    />
  );
}

/** Today / tomorrow chips plus an in-place Jalali calendar for any later day. */
export function DayPicker({
  value,
  onChange,
}: {
  /** Kept for callers; the calendar needs no form name. */
  name?: string;
  value: string;
  onChange: (ymd: string) => void;
}) {
  const today = salonTodayYmd();
  const tomorrow = addDaysYmd(today, 1);
  const other = !!value && value !== today && value !== tomorrow;
  const [calendarOpen, setCalendarOpen] = useState(other);

  return (
    <section className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-foreground-muted">روز</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={pickerChip(value === today)}
          onClick={() => {
            onChange(today);
            setCalendarOpen(false);
          }}
        >
          امروز
        </button>
        <button
          type="button"
          className={pickerChip(value === tomorrow)}
          onClick={() => {
            onChange(tomorrow);
            setCalendarOpen(false);
          }}
        >
          فردا
        </button>
        <button
          type="button"
          className={cn(pickerChip(other || calendarOpen), "px-3")}
          aria-expanded={calendarOpen}
          onClick={() => setCalendarOpen((v) => !v)}
        >
          {other ? dayLabel(value) : "روز دیگر"}
        </button>
      </div>
      {calendarOpen ? <MonthCalendar value={value} onChange={onChange} min={today} max={lastBookableDay()} /> : null}
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
