import { formatToman } from "@/shared/utils/salonDisplay";
import type { IMyAppointmentService } from "../types/appointments.type";

export interface CancelEstimate {
  /** Biggest tier threshold of the booked services; 0 = cancelling was always free. */
  windowHours: number;
  /** Penalty % that applies if the customer cancels right now (highest across the services). */
  percent: number;
  /** Amount of the held deposit that would be kept; null when the paid deposit is unknown. */
  penalty: number | null;
  /** What would go back; null when the paid deposit is unknown. */
  refund: number | null;
  hoursLeft: number;
}

const HOUR_MS = 3_600_000;

/**
 * What cancelling now would cost, from the ladder booked on each service («کمتر از N ساعت مانده ←
 * X٪») applied to that service's share of the deposit. Approximate: the appointment start is
 * used for every line. Null when the API sent no ladder at all (nothing honest to say).
 */
export function estimateCancelPenalty(
  services: IMyAppointmentService[],
  startTime: string,
  nowMs = Date.now()
): CancelEstimate | null {
  if (!services.some((s) => Array.isArray(s.cancellationTiers))) return null;

  const hoursLeft = (new Date(startTime).getTime() - nowMs) / HOUR_MS;
  let windowHours = 0;
  let percent = 0;
  let penalty = 0;
  let held = 0;
  let heldKnown = true;

  for (const s of services) {
    const tiers = s.cancellationTiers ?? [];
    for (const t of tiers) windowHours = Math.max(windowHours, t.hoursBefore);
    // The tightest step that already applies (fewest hours before) carries the highest penalty.
    const step = tiers
      .filter((t) => hoursLeft < t.hoursBefore)
      .sort((a, b) => a.hoursBefore - b.hoursBefore)[0];
    const pct = step?.penaltyPercent ?? 0;
    percent = Math.max(percent, pct);
    if (s.depositPaid == null) heldKnown = false;
    else {
      held += s.depositPaid;
      penalty += Math.round((s.depositPaid * pct) / 100);
    }
  }

  return {
    windowHours,
    percent,
    penalty: heldKnown ? penalty : null,
    refund: heldKnown ? Math.max(0, held - penalty) : null,
    hoursLeft,
  };
}

/** The one-line customer note above «لغو نوبت»; null when there is nothing reliable to say. */
export function cancelTermsNote(est: CancelEstimate | null): { text: string; costly: boolean } | null {
  if (!est) return null;
  const money = (n: number) => `${formatToman(n)} تومان`;

  if (est.penalty != null && est.penalty > 0) {
    const back = est.refund && est.refund > 0 ? ` و ${money(est.refund)} برمی‌گردد` : "";
    return { text: `اگر الان لغو کنید، حدود ${money(est.penalty)} از بیعانه ضبط می‌شود${back}.`, costly: true };
  }
  if (est.penalty == null && est.percent > 0) {
    return { text: `اگر الان لغو کنید، ${est.percent}٪ از بیعانه ضبط می‌شود.`, costly: true };
  }
  if (est.windowHours > 0 && est.hoursLeft >= est.windowHours) {
    return { text: `لغو رایگان تا ${est.windowHours} ساعت قبل از نوبت.`, costly: false };
  }
  return { text: "لغو الان رایگان است.", costly: false };
}
