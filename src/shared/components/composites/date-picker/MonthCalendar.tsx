"use client";

import { useState } from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { addDaysYmd, formatSalonDate, salonTodayYmd, ymdToDate } from "@/shared/utils/salonTime";
import { cn } from "@/shared/utils/className";

const WEEKDAY_HEADERS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

/** «پنج‌شنبه 9 مهر» */
export function dayLabel(ymd: string): string {
  try {
    return formatSalonDate(ymdToDate(ymd), { weekday: "long", day: "numeric", month: "long" });
  } catch {
    return ymd;
  }
}

const jalaliDay = (ymd: string) => Number(formatSalonDate(ymdToDate(ymd), { day: "numeric" }));
const jalaliMonthStart = (ymd: string) => addDaysYmd(ymd, 1 - jalaliDay(ymd));
/** First day of the next Jalali month (months are 29–31 days long). */
const nextMonthStart = (start: string) => jalaliMonthStart(addDaysYmd(start, 32));
const prevMonthStart = (start: string) => jalaliMonthStart(addDaysYmd(start, -1));
/** Column in a Saturday-first week (Date#getUTCDay: 0 = Sunday). */
const weekColumn = (ymd: string) => (ymdToDate(ymd).getUTCDay() + 1) % 7;

/**
 * The one Jalali month grid used by every date field — drawn in place (no external script and no
 * popup appended to `<body>`), so it also works inside the vaul drawers. Days outside
 * `min`..`max` (both `yyyy-MM-dd`, inclusive) are disabled.
 */
export function MonthCalendar({
  value,
  onChange,
  min,
  max,
}: {
  value: string;
  onChange: (ymd: string) => void;
  min?: string;
  max?: string;
}) {
  const today = salonTodayYmd();
  const [month, setMonth] = useState(() => {
    let start = value || today;
    if (min && start < min) start = min;
    if (max && start > max) start = max;
    return jalaliMonthStart(start);
  });

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
          disabled={!!min && month <= jalaliMonthStart(min)}
          onClick={() => setMonth(prevMonthStart(month))}
          aria-label="ماه قبل"
        >
          <CaretRightIcon size={16} />
        </button>
        <span className="text-sm font-bold text-foreground">{title}</span>
        <button
          type="button"
          className={navButton}
          disabled={!!max && end > max}
          onClick={() => setMonth(end)}
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
          const disabled = (!!min && d < min) || (!!max && d > max);
          const selected = d === value;
          return (
            <button
              key={d}
              type="button"
              disabled={disabled}
              onClick={() => onChange(d)}
              aria-label={dayLabel(d)}
              aria-pressed={selected}
              className={cn(
                "flex h-9 items-center justify-center rounded-full text-sm tabular-nums transition-colors",
                selected
                  ? "bg-primary font-bold text-primary-foreground"
                  : disabled
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
