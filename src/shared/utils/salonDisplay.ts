/** Format Toman amounts for display (fa-IR digits, no currency suffix). */
export function formatToman(amount: number | null | undefined): string {
  if (amount == null || !Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("fa-IR").format(amount);
}

export function salonImageSrc(
  url: string | null | undefined,
  fallback: string
): string {
  if (url && /^https?:\/\//i.test(url)) return url;
  if (url && url.startsWith("/")) return url;
  return fallback;
}
