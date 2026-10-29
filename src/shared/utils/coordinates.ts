/**
 * Branch coordinates are «both or none», finite, inside the globe — the same rule as the backend
 * (`SalonBranch.UpdateInfo`, `branch_coordinates_*`), checked here first so the owner gets a clear message.
 */
export function coordinatesPairError(
  latitude: number | null | undefined,
  longitude: number | null | undefined
): string | null {
  const hasLat = latitude != null;
  const hasLng = longitude != null;
  if (!hasLat && !hasLng) return null;
  if (hasLat !== hasLng) return "عرض و طول جغرافیایی را هر دو وارد کنید، یا هر دو را خالی بگذارید.";
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return "مختصات نامعتبر است.";
  if (Math.abs(latitude as number) > 90) return "عرض جغرافیایی باید بین ۹۰- و ۹۰ باشد.";
  if (Math.abs(longitude as number) > 180) return "طول جغرافیایی باید بین ۱۸۰- و ۱۸۰ باشد.";
  return null;
}

/** Text → number | null for a manual coordinate field; anything unparsable becomes NaN so it is reported, not dropped. */
export function parseCoordinateInput(raw: string): number | null {
  const text = raw.trim().replace(/[,٫،]/g, ".");
  if (text === "") return null;
  return Number(text);
}

/** 6 decimals ≈ 0.1 m — plenty, and keeps the stored value tidy. */
export function roundCoordinate(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}
