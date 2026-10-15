import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";

/**
 * Longest reason the backend accepts for correcting a no-show: the status-history column holds
 * 500 characters and the longest prefix written before the reason is 18, so the contract is 482
 * (counted after trimming, in UTF-16 units — the same as JS `string.length`).
 */
export const UNDO_NO_SHOW_REASON_MAX = 482;

export type TReasonCheck = { ok: true; reason: string } | { ok: false; error: string };

/** Required, trimmed, at most {@link UNDO_NO_SHOW_REASON_MAX} characters. */
export function checkUndoNoShowReason(raw: string): TReasonCheck {
  const reason = raw.trim();
  if (!reason) return { ok: false, error: "علت اصلاح را بنویسید." };
  if (reason.length > UNDO_NO_SHOW_REASON_MAX) {
    return { ok: false, error: `علت اصلاح حداکثر ${UNDO_NO_SHOW_REASON_MAX} نویسه است.` };
  }
  return { ok: true, reason };
}

/** Server error `field`s are the lower-cased domain codes of the no-show correction. */
const ERROR_MESSAGES: Record<string, string> = {
  appointment_cannot_undo_noshow: "این نوبت دیگر در وضعیت «مراجعه نکرد» نیست. صفحه را به‌روزرسانی کنید.",
  appointment_undo_noshow_reason_required: "علت اصلاح را بنویسید.",
  appointment_undo_noshow_reason_too_long: `علت اصلاح حداکثر ${UNDO_NO_SHOW_REASON_MAX} نویسه است.`,
  appointment_undo_noshow_expired:
    "مهلت اصلاح 24 ساعته گذشته است. برای اصلاح با پشتیبانی صفا تماس بگیرید.",
  appointment_undo_noshow_unavailable:
    "این «مراجعه نکرد» مربوط به نوبت‌های قدیمی است و اطلاعات کافی برای اصلاح خودکار ندارد. با پشتیبانی صفا تماس بگیرید.",
  appointment_undo_noshow_lines_required:
    "برای این نوبت قدیمی باید خدمت‌هایی را که دوباره باز می‌شوند، خودتان انتخاب کنید.",
  appointment_undo_noshow_lines_invalid:
    "خدمت‌های انتخاب‌شده معتبر نیستند: ممکن است تکراری، هم‌پوشان یا مربوط به نوبت دیگری باشند.",
  appointment_undo_noshow_lines_not_allowed:
    "برای این نوبت خدمت‌ها خودکار تعیین می‌شوند و انتخاب دستی مجاز نیست.",
  appointment_status_reason_too_long: `علت اصلاح حداکثر ${UNDO_NO_SHOW_REASON_MAX} نویسه است.`,
};

function errorFields(error: unknown): string[] {
  const errors = (error as { response?: { data?: { errors?: unknown } } })?.response?.data?.errors;
  if (Array.isArray(errors)) {
    return errors
      .map((e) => (e as { field?: unknown })?.field)
      .filter((f): f is string => typeof f === "string")
      .map((f) => f.toLowerCase());
  }
  if (errors && typeof errors === "object") {
    return Object.keys(errors as Record<string, unknown>).map((k) => k.toLowerCase());
  }
  return [];
}

/** A friendly Persian message for the no-show correction; unknown errors keep the server text / fallback. */
export function getUndoNoShowErrorMessage(
  error: unknown,
  fallback = "اصلاح «مراجعه نکرد» ناموفق بود."
): string {
  for (const field of errorFields(error)) {
    const message = ERROR_MESSAGES[field];
    if (message) return message;
  }
  return getApiErrorMessage(error, fallback);
}
