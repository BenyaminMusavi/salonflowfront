/**
 * Salon wall-clock time is always Asia/Tehran, independent of the viewer's device timezone
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

/** Salon-local date ("yyyy-MM-dd") + time ("HH:mm" / "HH:mm:ss") → UTC ISO instant. */
export function salonWallClockToUtcIso(date: string, time: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const [hours = 0, minutes = 0, seconds = 0] = time.split(":").map(Number);
  const asIfUtc = Date.UTC(year, month - 1, day, hours, minutes, seconds);
  return new Date(asIfUtc - salonOffsetMinutes(new Date(asIfUtc)) * 60_000).toISOString();
}
