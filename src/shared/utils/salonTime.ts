import { APP_LOCALE } from "./locale";

/**
 * All times and dates in the app are Asia/Tehran, independent of the viewer's device timezone
 * (backend contract: slot/first-available start/end are UTC and must be converted explicitly —
 * a customer abroad must still see and book the salon's own local times).
 */
export const SALON_TIME_ZONE = "Asia/Tehran";

/** Fallback when the runtime can't report the zone offset (Iran has no DST since 2022). */
const TEHRAN_FALLBACK_OFFSET_MINUTES = 3 * 60 + 30;

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: SALON_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

/** UTC ISO instant → salon-local "HH:mm:ss". */
export function utcToSalonTime(iso: string): string {
  const parts = timeFormatter.formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("hour")}:${get("minute")}:${get("second")}`;
}

/** Offset of the salon timezone from UTC at `instant`, in minutes (Tehran → +210). */
function salonOffsetMinutes(instant: Date): number {
  try {
    const name = new Intl.DateTimeFormat("en-US", {
      timeZone: SALON_TIME_ZONE,
      timeZoneName: "longOffset",
    })
      .formatToParts(instant)
      .find((p) => p.type === "timeZoneName")?.value;
    const match = name?.match(/GMT([+-])(\d{2}):?(\d{2})?/);
    if (!match) return TEHRAN_FALLBACK_OFFSET_MINUTES;
    const minutes = Number(match[2]) * 60 + Number(match[3] ?? 0);
    return match[1] === "-" ? -minutes : minutes;
  } catch {
    return TEHRAN_FALLBACK_OFFSET_MINUTES;
  }
}

type TDateInput = string | number | Date;

/** Intl formatting of an instant in salon time (Persian words, Latin digits, Jalali calendar). */
export function formatSalonDateTime(value: TDateInput, options?: Intl.DateTimeFormatOptions): string {
  return new Date(value).toLocaleString(APP_LOCALE, { ...options, timeZone: SALON_TIME_ZONE });
}

export function formatSalonDate(value: TDateInput, options?: Intl.DateTimeFormatOptions): string {
  return new Date(value).toLocaleDateString(APP_LOCALE, { ...options, timeZone: SALON_TIME_ZONE });
}

export function formatSalonTime(value: TDateInput, options?: Intl.DateTimeFormatOptions): string {
  return new Date(value).toLocaleTimeString(APP_LOCALE, { ...options, timeZone: SALON_TIME_ZONE });
}

/**
 * A calendar day ("yyyy-MM-dd", no time) as a Date for formatting with the salon zone: UTC noon
 * falls on the same Tehran day, whatever the device timezone (local-midnight parsing doesn't).
 */
export function ymdToDate(ymd: string): Date {
  return new Date(`${ymd}T12:00:00Z`);
}

const ymdFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: SALON_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Salon-calendar day ("yyyy-MM-dd") of an instant — e.g. the day a UTC appointment falls on. */
export function utcToSalonYmd(value: TDateInput): string {
  return ymdFormatter.format(new Date(value));
}

/** Today's date in Tehran ("yyyy-MM-dd"), not the device's. */
export function salonTodayYmd(now: Date = new Date()): string {
  return utcToSalonYmd(now);
}

/** Calendar arithmetic on "yyyy-MM-dd" (timezone-free). */
export function addDaysYmd(ymd: string, days: number): string {
  const d = ymdToDate(ymd);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Hour/minute of an instant on the salon clock (for calendar-grid positioning). */
export function salonClockParts(value: TDateInput): { hours: number; minutes: number } {
  const [hours, minutes] = utcToSalonTime(new Date(value).toISOString()).split(":").map(Number);
  return { hours, minutes };
}

/** Day of week on the salon calendar, same numbering as Date#getDay (0 = Sunday). */
export function salonWeekday(value: TDateInput = new Date()): number {
  return ymdToDate(utcToSalonYmd(value)).getUTCDay();
}

/** Salon-local date ("yyyy-MM-dd") + time ("HH:mm" / "HH:mm:ss") → UTC ISO instant. */
export function salonWallClockToUtcIso(date: string, time: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const [hours = 0, minutes = 0, seconds = 0] = time.split(":").map(Number);
  const asIfUtc = Date.UTC(year, month - 1, day, hours, minutes, seconds);
  return new Date(asIfUtc - salonOffsetMinutes(new Date(asIfUtc)) * 60_000).toISOString();
}
