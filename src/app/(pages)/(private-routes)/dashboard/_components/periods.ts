import { addDaysYmd, formatSalonDate, salonTodayYmd, salonWeekday, ymdToDate } from "@/shared/utils/salonTime";

/** Day of the Jalali month (1–31) of a Tehran day. */
function jalaliDayOfMonth(ymd: string): number {
  return Number(formatSalonDate(ymdToDate(ymd), { day: "numeric" }));
}

const jalaliMonthStart = (ymd: string) => addDaysYmd(ymd, 1 - jalaliDayOfMonth(ymd));

export type PeriodId = "today" | "yesterday" | "week" | "month" | "lastMonth";

export const PERIOD_LABEL: Record<PeriodId, string> = {
  today: "امروز",
  yesterday: "دیروز",
  week: "این هفته",
  month: "این ماه",
  lastMonth: "ماه قبل",
};

/**
 * Inclusive Tehran-day range of a period. Weeks start on Saturday and months are Jalali
 * months — what a salon owner means by «این هفته» / «این ماه».
 */
export function periodRange(period: PeriodId, today = salonTodayYmd()): { from: string; to: string } {
  switch (period) {
    case "today":
      return { from: today, to: today };
    case "yesterday": {
      const d = addDaysYmd(today, -1);
      return { from: d, to: d };
    }
    case "week": {
      // JS weekday: Saturday = 6 → 0 days back, Sunday = 0 → 1 day back, …
      const back = (salonWeekday(ymdToDate(today)) + 1) % 7;
      return { from: addDaysYmd(today, -back), to: today };
    }
    case "month":
      return { from: jalaliMonthStart(today), to: today };
    case "lastMonth": {
      const end = addDaysYmd(jalaliMonthStart(today), -1);
      return { from: jalaliMonthStart(end), to: end };
    }
  }
}
