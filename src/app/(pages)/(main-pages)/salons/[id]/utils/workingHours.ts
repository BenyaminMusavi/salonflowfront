import { ISalonWorkingHour } from "@/services/domains/salons/types/salon.type";
import { salonWeekday } from "@/shared/utils/salonTime";

/** JS getDay(): 0=Sun … 6=Sat. Only used to convert a JS Date to a day-name string for
 * matching against workingHours[].dayName — unrelated to the working-schedules/onboarding
 * numeric dayOfWeek contract (0=شنبه … 6=جمعه as of commit 8e33909). */
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

/** Iranian week order (\u0634\u0646\u0628\u0647 \u2192 \u062c\u0645\u0639\u0647), by index into FA_DAY_BY_WEEKDAY/EN_DAY_BY_WEEKDAY. */
const IRANIAN_WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5];

const IRANIAN_WEEK_RANK: Record<string, number> = (() => {
  const rank: Record<string, number> = {};
  IRANIAN_WEEK_ORDER.forEach((weekdayIndex, position) => {
    rank[normalizeDayLabel(FA_DAY_BY_WEEKDAY[weekdayIndex])] = position;
    rank[normalizeDayLabel(EN_DAY_BY_WEEKDAY[weekdayIndex])] = position;
  });
  return rank;
})();

/** Sorts working hours \u0634\u0646\u0628\u0647 \u2192 \u062c\u0645\u0639\u0647 regardless of the order the API returned them in. */
export function sortByIranianWeek<T extends { dayName?: string | null }>(
  hours: T[]
): T[] {
  return [...hours].sort((a, b) => {
    const rankA = IRANIAN_WEEK_RANK[normalizeDayLabel(a.dayName ?? "")] ?? 99;
    const rankB = IRANIAN_WEEK_RANK[normalizeDayLabel(b.dayName ?? "")] ?? 99;
    return rankA - rankB;
  });
}

/** Weekday on the salon (Tehran) calendar — near midnight it can differ from the device's. */
function todayFaDayName(date = new Date()): string {
  return FA_DAY_BY_WEEKDAY[salonWeekday(date)];
}

export function findTodayWorkingHour(
  hours: ISalonWorkingHour[] | null | undefined,
  date = new Date()
): ISalonWorkingHour | undefined {
  if (!hours?.length) return undefined;

  const faToday = normalizeDayLabel(todayFaDayName(date));
  const enToday = EN_DAY_BY_WEEKDAY[salonWeekday(date)];

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
