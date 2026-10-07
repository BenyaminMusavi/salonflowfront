"use client";

import { useState } from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { addDaysYmd, formatSalonDate, salonTodayYmd, ymdToDate } from "@/shared/utils/salonTime";
import { cn } from "@/shared/utils/className";

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

const WEEKDAY_HEADERS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
/** How far ahead the calendar lets the salon book (months). */
const MAX_MONTHS_AHEAD = 12;

const jalaliDay = (ymd: string) => Number(formatSalonDate(ymdToDate(ymd), { day: "numeric" }));
const jalaliMonthStart = (ymd: string) => addDaysYmd(ymd, 1 - jalaliDay(ymd));
/** First day of the next Jalali month (months are 29–31 days long). */
const nextMonthStart = (start: string) => jalaliMonthStart(addDaysYmd(start, 32));
const prevMonthStart = (start: string) => jalaliMonthStart(addDaysYmd(start, -1));
/** Column in a Saturday-first week (Date#getUTCDay: 0 = Sunday). */
const weekColumn = (ymd: string) => (ymdToDate(ymd).getUTCDay() + 1) % 7;

/**
 * A Jalali month grid drawn in place — no external date-picker script, so it also works inside
 * the vaul drawers (which turn pointer events off outside themselves). Past days are disabled.
 */
function MonthCalendar({ value, onChange }: { value: string; onChange: (ymd: string) => void }) {
  const today = salonTodayYmd();
  const firstMonth = jalaliMonthStart(today);
  const [month, setMonth] = useState(() => jalaliMonthStart(value && value >= today ? value : today));

  let lastMonth = firstMonth;
  for (let i = 0; i < MAX_MONTHS_AHEAD; i++) lastMonth = nextMonthStart(lastMonth);

  const end = nextMonthStart(month);
  const days: string[] = [];
  for (let d = month; d < end; d = addDaysYmd(d, 1)) days.push(d);
  const title = `${formatSalonDate(ymdToDate(month), { month: "long" })} ${formatSalonDate(ymdToDate(month), { year: "numeric" })}`;
  const navButton =
    "flex h-8 w-8 items-center justify-center rounded-full text-foreground hover:bg-surface-hover disabled:opacity-30";

  return (
    <div className="flex flex-col gap-2 rounded-[16px] bg-background-secondary p-3">
      <div className="flex items-center justify-between">
        {/* RTL: «previous month» sits on the right. */}
        <button
          type="button"
          className={navButton}
          disabled={month <= firstMonth}
          onClick={() => setMonth(prevMonthStart(month))}
          aria-label="ماه قبل"
        >
          <CaretRightIcon size={16} />
        </button>
        <span className="text-sm font-bold text-foreground">{title}</span>
        <button
          type="button"
          className={navButton}
          disabled={month >= lastMonth}
          onClick={() => setMonth(nextMonthStart(month))}
          aria-label="ماه بعد"
        >
          <CaretLeftIcon size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_HEADERS.map((w, i) => (
          <span key={w} className={cn("py-1 text-[11px] font-semibold", i === 6 ? "text-error" : "text-foreground-muted")}>
            {w}
          </span>
        ))}
        {Array.from({ length: weekColumn(month) }, (_, i) => (
          <span key={`pad-${i}`} />
        ))}
        {days.map((d) => {
          const past = d < today;
          const selected = d === value;
          return (
            <button
              key={d}
              type="button"
              disabled={past}
              onClick={() => onChange(d)}
              aria-label={dayLabel(d)}
              aria-pressed={selected}
              className={cn(
                "flex h-9 items-center justify-center rounded-full text-sm tabular-nums transition-colors",
                selected
                  ? "bg-primary font-bold text-primary-foreground"
                  : past
                    ? "text-foreground-muted opacity-40"
                    : "text-foreground hover:bg-surface-hover",
                d === today && !selected && "ring-1 ring-primary"
              )}
            >
              {jalaliDay(d)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * A labelled date field that opens the in-place calendar below itself — use it instead of
 * `DashboardDateField` inside vaul drawers, where the external picker's popup can't be clicked.
 */
export function InlineDateField({
  label,
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
}: {
  label: string;
  value: string;
  onChange: (ymd: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-foreground-muted">{label}</span>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-11 items-center rounded-[12px] border border-input-border bg-input px-3 text-right text-sm",
          value ? "text-foreground" : "text-foreground-muted"
        )}
      >
        {value ? dayLabel(value) : placeholder}
      </button>
      {open ? (
        <MonthCalendar
          value={value}
          onChange={(d) => {
            onChange(d);
            setOpen(false);
          }}
        />
      ) : null}
    </div>
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
      {calendarOpen ? <MonthCalendar value={value} onChange={onChange} /> : null}
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
