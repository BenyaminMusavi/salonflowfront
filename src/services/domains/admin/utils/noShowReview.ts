import type {
  IAdminNoShowReview,
  IAdminNoShowReviewLine,
  IRevertNoShowRequest,
} from "../types/admin.type";
import { checkUndoNoShowReason } from "@/services/domains/appointments/utils/undoNoShow";

/** AppointmentServiceStatus.Cancelled — only cancelled lines can be reopened. */
const SERVICE_STATUS_CANCELLED = 4;

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Accepts a pasted appointment id (with stray spaces / braces) and returns the Guid, or null. */
export function parseAppointmentPublicId(raw: string): string | null {
  const text = raw.trim().replace(/^[{(]|[})]$/g, "").trim();
  return GUID.test(text) ? text.toLowerCase() : null;
}

/** Lines the admin may pick when the server asks for an explicit choice. */
export function selectableLines(review: IAdminNoShowReview): IAdminNoShowReviewLine[] {
  return review.lines.filter((l) => Number(l.status) === SERVICE_STATUS_CANCELLED);
}

export function needsExplicitLines(review: IAdminNoShowReview): boolean {
  return review.resolution === "explicitLinesRequired";
}

export function resolutionLabel(resolution: string): string {
  switch (resolution) {
    case "automatic":
      return "خدمت‌های برگشتنی خودکار تعیین می‌شوند";
    case "explicitLinesRequired":
      return "نوبت قدیمی است؛ باید خدمت‌ها را خودتان انتخاب کنید";
    case "notNoShow":
      return "این نوبت در وضعیت «مراجعه نکرد» نیست";
    default:
      return "وضعیت نامشخص";
  }
}

export type TRevertPayload = { ok: true; payload: IRevertNoShowRequest } | { ok: false; error: string };

/**
 * Builds the body of `revert-no-show` without ever choosing lines for the admin:
 * `automatic` rows send no lines (the server rejects them), legacy rows need at least one picked line.
 */
export function buildRevertNoShowPayload(
  review: IAdminNoShowReview,
  selectedServicePublicIds: readonly string[],
  rawReason: string
): TRevertPayload {
  if (review.resolution === "notNoShow") return { ok: false, error: "این نوبت در وضعیت «مراجعه نکرد» نیست." };

  const reason = checkUndoNoShowReason(rawReason);
  if (!reason.ok) return { ok: false, error: reason.error };

  if (!needsExplicitLines(review)) return { ok: true, payload: { reason: reason.reason } };

  const allowed = new Set(selectableLines(review).map((l) => l.servicePublicId));
  const picked = Array.from(new Set(selectedServicePublicIds)).filter((id) => allowed.has(id));
  if (picked.length === 0) {
    return { ok: false, error: "حداقل یک خدمت را برای بازگرداندن انتخاب کنید." };
  }
  return { ok: true, payload: { reason: reason.reason, servicePublicIds: picked } };
}
