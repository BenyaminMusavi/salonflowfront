/**
 * The backend's booking-create/quick-book endpoints require startTime as a UTC ISO
 * instant (see docs/FRONTEND_INTEGRATION_GUIDE.md — "startTime | datetime | UTC/ISO").
 * `date`/`time` here are wall-clock values in the salon's local time (e.g. the
 * "HH:mm:ss" produced from GET /api/booking/slots), so they must be interpreted as
 * local and converted to UTC — not sent as a bare, timezone-less string, which the
 * backend would otherwise misinterpret as already being UTC and silently shift by
 * the local offset (e.g. "10:00" local becoming a check against 13:30 local in
 * Asia/Tehran), corrupting which slot actually gets booked.
 */
export function toBookingStartTime(date: string, time: string): string {
  const normalized =
    time.length === 5 ? `${time}:00` : time.length === 8 ? time : `${time}:00`;
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes, seconds] = normalized.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes, seconds).toISOString();
}

export const SUBSCRIPTION_OWNER_LOCK_MESSAGE =
  "برای ثبت نوبت باید اشتراک فعال (آزمایشی، فعال یا مهلت پرداخت) داشته باشید.";

export const SUBSCRIPTION_CUSTOMER_LOCK_MESSAGE =
  "این سالن فعلاً رزرو نمی‌پذیرد.";

type ApiErrorBody = Record<string, unknown>;

function getErrorBody(error: unknown): ApiErrorBody | undefined {
  return (error as { response?: { data?: ApiErrorBody } })?.response?.data;
}

function isSubscriptionFieldName(field: unknown): boolean {
  return typeof field === "string" && field.toLowerCase() === "subscription";
}

/** Backend 400 on create/quick-book when the salon owner is not billable. */
export function isSubscriptionFieldError(error: unknown): boolean {
  const data = getErrorBody(error);
  if (!data) return false;

  const errors = data.errors;
  if (Array.isArray(errors)) {
    return errors.some((item) =>
      isSubscriptionFieldName((item as { field?: unknown })?.field)
    );
  }
  if (errors && typeof errors === "object") {
    return Object.keys(errors as Record<string, unknown>).some((key) =>
      isSubscriptionFieldName(key)
    );
  }
  return false;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "خطایی رخ داده است",
  options?: { audience?: "customer" | "owner" }
): string {
  if (isSubscriptionFieldError(error)) {
    return options?.audience === "customer"
      ? SUBSCRIPTION_CUSTOMER_LOCK_MESSAGE
      : SUBSCRIPTION_OWNER_LOCK_MESSAGE;
  }

  const data = getErrorBody(error);
  if (!data) return fallback;

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  const errors = data.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0] as { message?: string };
    if (first?.message) return first.message;
  }

  if (errors && typeof errors === "object" && !Array.isArray(errors)) {
    const values = Object.values(errors as Record<string, unknown>);
    const first = values[0];
    if (Array.isArray(first) && typeof first[0] === "string") return first[0];
    if (typeof first === "string") return first;
  }

  const type = data.type;
  if (type === "authorization_error") {
    return "برای رزرو باید وارد حساب مشتری شوید.";
  }
  if (type === "authentication_error") {
    return "نشست شما منقضی شده است. دوباره وارد شوید.";
  }

  return fallback;
}
