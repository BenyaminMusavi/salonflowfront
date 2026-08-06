import { ISalonWorkingHour } from "@/services/domains/salons/types/salon.type";

/** JS getDay(): 0=Sun … 6=Sat — matches onboarding / schedules labels. */
const FA_DAY_BY_WEEKDAY = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
  "شنبه",
] as const;

const EN_DAY_BY_WEEKDAY = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

function normalizeDayLabel(value: string): string {
  return value
    .trim()
    .replace(/\u200c/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function todayFaDayName(date = new Date()): string {
  return FA_DAY_BY_WEEKDAY[date.getDay()];
}

export function findTodayWorkingHour(
  hours: ISalonWorkingHour[] | null | undefined,
  date = new Date()
): ISalonWorkingHour | undefined {
  if (!hours?.length) return undefined;

  const faToday = normalizeDayLabel(todayFaDayName(date));
  const enToday = EN_DAY_BY_WEEKDAY[date.getDay()];

  return hours.find((h) => {
    const label = normalizeDayLabel(h.dayName ?? "");
    return label === faToday || label === enToday || label.includes(faToday);
  });
}

export function formatHourRange(
  start?: string | null,
  end?: string | null
): string {
  const s = start?.trim();
  const e = end?.trim();
  if (s && e) return `${s} – ${e}`;
  if (s) return `از ${s}`;
  if (e) return `تا ${e}`;
  return "—";
}

/** Chip / trust-row label for today. */
export function getOpenStatusLabel(
  hours: ISalonWorkingHour[] | null | undefined,
  date = new Date()
): string | null {
  const today = findTodayWorkingHour(hours, date);
  if (!today) return null;
  if (today.isOff) return "امروز تعطیل";
  if (today.end?.trim()) return `باز تا ${today.end.trim()}`;
  if (today.start?.trim()) return `امروز از ${today.start.trim()}`;
  return "امروز باز است";
}
