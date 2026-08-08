export function toBookingStartTime(date: string, time: string): string {
  const normalized =
    time.length === 5 ? `${time}:00` : time.length === 8 ? time : `${time}:00`;
  return `${date}T${normalized}`;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "خطایی رخ داده است"
): string {
  const data = (error as { response?: { data?: Record<string, unknown> } })
    ?.response?.data;
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
