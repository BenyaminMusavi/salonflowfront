import { formatPercent } from "@/shared/utils/percent";
import type { ICalculatePriceResult } from "../types/booking-browse.type";

export interface CancellationServiceLines {
  serviceName: string;
  /** «کمتر از 24 ساعت مانده: 50٪» — hardest (earliest) step first. */
  tiers: string[];
  /** «مراجعه‌نکردن: 100٪» or null. */
  noShow: string | null;
}

export interface CancellationSummary {
  /** «لغو رایگان تا 24 ساعت قبل از نوبت.» / «لغو همیشه رایگان است.» */
  freeText: string;
  /** Per service with a ladder or a no-show penalty; empty when cancelling is always free. */
  lines: CancellationServiceLines[];
}

/** The customer-facing cancellation terms of a price quote, from the services' own ladders. */
export function cancellationSummary(price: ICalculatePriceResult): CancellationSummary {
  const hours = price.freeCancellationWindowHours;
  const freeText = hours > 0 ? `لغو رایگان تا ${hours} ساعت قبل از نوبت.` : "لغو همیشه رایگان است.";

  const lines = price.services
    .map((s) => ({
      serviceName: s.serviceName,
      tiers: [...(s.cancellationTiers ?? [])]
        .sort((a, b) => b.hoursBefore - a.hoursBefore)
        .map((t) => `کمتر از ${t.hoursBefore} ساعت مانده: ${formatPercent(t.penaltyPercent)}`),
      noShow: (s.noShowPenaltyPercent ?? 0) > 0 ? `مراجعه‌نکردن: ${formatPercent(s.noShowPenaltyPercent ?? 0)}` : null,
    }))
    .filter((l) => l.tiers.length > 0 || l.noShow);

  return { freeText, lines };
}
