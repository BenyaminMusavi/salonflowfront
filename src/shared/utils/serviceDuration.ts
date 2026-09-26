/**
 * Service durations snap to 15-minute steps (product rule): the booking grid is 15 minutes, so
 * a 20- or 37-minute service would leave unusable gaps in the salon's day.
 */
export const DURATION_STEP = 15;
export const DURATION_MIN = 15;
export const DURATION_MAX = 8 * 60;

export function isValidServiceDuration(minutes: number | null | undefined): boolean {
  return (
    minutes != null &&
    Number.isInteger(minutes) &&
    minutes >= DURATION_MIN &&
    minutes <= DURATION_MAX &&
    minutes % DURATION_STEP === 0
  );
}

/** «45 دقیقه»، «1 ساعت»، «1 ساعت و 15 دقیقه». */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} دقیقه`;
  if (m === 0) return `${h} ساعت`;
  return `${h} ساعت و ${m} دقیقه`;
}

/** Compact chip label: «45 دقیقه»، «1 ساعت»، «1.5 ساعت». */
export function formatDurationShort(minutes: number): string {
  if (minutes < 60) return `${minutes} دقیقه`;
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1).replace(/\.0$/, "")} ساعت`;
}

/** One step down / up, snapping an off-grid legacy value (e.g. 20) to the nearest multiple first. */
export function stepDuration(minutes: number, direction: -1 | 1): number {
  const snapped =
    minutes % DURATION_STEP === 0
      ? minutes + direction * DURATION_STEP
      : (direction === 1 ? Math.ceil : Math.floor)(minutes / DURATION_STEP) * DURATION_STEP;
  return Math.min(DURATION_MAX, Math.max(DURATION_MIN, snapped));
}
