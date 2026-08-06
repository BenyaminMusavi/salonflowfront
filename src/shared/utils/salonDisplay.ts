import { API_BASE_URL } from "@/services/common/apiAddress";

/** Format Toman amounts for display (fa-IR digits, no currency suffix). */
export function formatToman(amount: number | null | undefined): string {
  if (amount == null || !Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("fa-IR").format(amount);
}

/** Resolve API media paths against NEXT_PUBLIC_API_DOMAIN for <img> / next/image. */
export function salonImageSrc(
  url: string | null | undefined,
  fallback: string
): string {
  if (!url) return fallback;

  const trimmed = url.trim();
  if (!trimmed) return fallback;

  if (/^(blob:|data:)/i.test(trimmed)) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const normalized = trimmed.replace(/\\/g, "/");
  if (!API_BASE_URL) return fallback;

  const base = API_BASE_URL.replace(/\/+$/, "");
  const path = normalized.startsWith("/") ? normalized : `/${normalized}`;
  return `${base}${path}`;
}
