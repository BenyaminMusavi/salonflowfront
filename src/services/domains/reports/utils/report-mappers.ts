import { addDaysYmd, salonTodayYmd, utcToSalonYmd } from "@/shared/utils/salonTime";

/** "yyyy-MM-dd" of an instant on the salon (Tehran) calendar. */
export function toDateOnly(d: Date): string {
  return utcToSalonYmd(d);
}

/** Guide default: 30 Tehran-calendar days through today (Tehran's today, not the device's). */
export function defaultReportRange(): { from: string; to: string } {
  const to = salonTodayYmd();
  return { from: addDaysYmd(to, -29), to };
}

export function asReportRows<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const obj = payload as { items?: T[]; data?: T[] };
    if (Array.isArray(obj.items)) return obj.items;
    if (Array.isArray(obj.data)) return obj.data;
  }
  return [];
}

export function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

export function metricFromUnknown(value: unknown): {
  value: number | null;
  percentChange: number | null;
} {
  if (value && typeof value === "object") {
    const obj = value as { value?: unknown; percentChange?: unknown };
    return {
      value: asNumber(obj.value),
      percentChange: asNumber(obj.percentChange),
    };
  }
  return { value: asNumber(value), percentChange: null };
}
