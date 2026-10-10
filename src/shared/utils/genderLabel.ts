/**
 * Persian label for a salon's / branch's GenderType. The API sends it as a number (1 Male,
 * 2 Female, 3 Mixed) on some DTOs and as the enum name ("Female") on catalog cards — never
 * show either raw.
 */
export function salonGenderLabel(value: string | number | null | undefined): string | null {
  const v = typeof value === "string" ? value.trim().toLowerCase() : value;
  if (v === 1 || v === "1" || v === "male") return "آقایان";
  if (v === 2 || v === "2" || v === "female") return "بانوان";
  if (v === 3 || v === "3" || v === "mixed" || v === "both") return "بانوان و آقایان";
  return null;
}
