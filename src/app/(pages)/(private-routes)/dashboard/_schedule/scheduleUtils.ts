import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";

/** API week order (0 = Saturday … 6 = Friday — backend `SalonWeek`). */
export const WEEK_DAYS = [
  { value: 0, label: "شنبه" },
  { value: 1, label: "یکشنبه" },
  { value: 2, label: "دوشنبه" },
  { value: 3, label: "سه‌شنبه" },
  { value: 4, label: "چهارشنبه" },
  { value: 5, label: "پنجشنبه" },
  { value: 6, label: "جمعه" },
];

/** «06:00» … «23:45» in 15-minute steps. */
export const TIME_OPTIONS: string[] = Array.from({ length: (24 - 6) * 4 }, (_, i) => {
  const minutes = 6 * 60 + i * 15;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});

/** API «HH:mm:ss» → «HH:mm». */
export const hhmm = (value?: string | null): string => (value ? value.slice(0, 5) : "");

/** «HH:mm» → API «HH:mm:00». */
export const toApiTime = (value: string): string => `${value}:00`;

export function scheduleErrorMessage(err: unknown, fallback: string): string {
  const status = (err as { response?: { status?: number } })?.response?.status;
  if (status === 403) return "فقط برنامه‌ی کاری خودتان را می‌توانید تغییر دهید.";
  return getApiErrorMessage(err, fallback);
}

export interface IDayHours {
  working: boolean;
  start: string;
  end: string;
  breakStart: string;
  breakEnd: string;
}

/** Returns a Persian error, or null when the hours make sense. */
export function validateDayHours(day: IDayHours): string | null {
  if (!day.working) return null;
  if (!day.start || !day.end || day.start >= day.end) return "ساعت پایان باید بعد از شروع باشد.";
  if (day.breakStart || day.breakEnd) {
    if (!day.breakStart || !day.breakEnd || day.breakStart >= day.breakEnd)
      return "پایان استراحت باید بعد از شروع آن باشد.";
    if (day.breakStart <= day.start || day.breakEnd >= day.end)
      return "استراحت باید داخل ساعت کاری باشد.";
  }
  return null;
}

export function formatDayHours(day: IDayHours): string {
  if (!day.working) return "تعطیل";
  const base = `${day.start} تا ${day.end}`;
  return day.breakStart && day.breakEnd ? `${base} · استراحت ${day.breakStart}–${day.breakEnd}` : base;
}
