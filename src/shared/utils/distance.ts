/**
 * Straight-line distance for salon cards, always approximate («تقریباً»): under 1 km in 50 m steps
 * («350 متر»), under 10 km one decimal («2.4 کیلومتر»), beyond that whole kilometres. Digits are Latin
 * (see AGENTS.md). Returns "" for a missing or invalid value so callers can simply skip rendering.
 */
export function formatDistanceKm(km: number | null | undefined): string {
  if (km == null || !Number.isFinite(km) || km < 0) return "";
  if (km < 1) {
    const meters = Math.max(50, Math.round((km * 1000) / 50) * 50);
    return meters >= 1000 ? "1 کیلومتر" : `${meters} متر`;
  }
  if (km < 10) return `${(Math.round(km * 10) / 10).toFixed(1)} کیلومتر`;
  return `${Math.round(km)} کیلومتر`;
}
