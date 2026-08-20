import { PaymentMethod, AppointmentStatus, AppointmentSource } from "@/services/common/enums/domain-enums";
import { formatToman } from "@/shared/utils/salonDisplay";

export function paymentMethodLabel(method: number | null | undefined): string {
  switch (method) {
    case PaymentMethod.Cash:
      return "نقدی";
    case PaymentMethod.Card:
      return "کارت";
    case PaymentMethod.Online:
      return "آنلاین";
    case PaymentMethod.Transfer:
      return "انتقال";
    case PaymentMethod.Wallet:
      return "کیف پول";
    default:
      return method != null ? `روش ${method}` : "نامشخص";
  }
}

export function appointmentSourceLabel(source: number | null | undefined): string {
  switch (source) {
    case AppointmentSource.Online:
      return "آنلاین";
    case AppointmentSource.WalkIn:
      return "حضوری";
    case AppointmentSource.Phone:
      return "تلفن";
    case AppointmentSource.Quick:
      return "رزرو سریع";
    default:
      return source != null ? `کانال ${source}` : "نامشخص";
  }
}

export { appointmentStatusLabel } from "@/services/domains/appointments/utils/appointment-display";

export function formatPercentChange(value: number | null | undefined): string | null {
  if (value == null || !Number.isFinite(value)) return null;
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}٪ نسبت به دوره قبل`;
}

export function formatMoneyOrDash(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${formatToman(value)} تومان`;
}

export function formatRate(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${value.toFixed(1)}٪`;
}

export const WEEKDAY_FA = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
  "شنبه",
];

export const EXPORT_REPORT_OPTIONS: Array<{
  value:
    | "dashboard-summary"
    | "revenue-by-day"
    | "revenue-by-method"
    | "revenue-by-service"
    | "staff-performance"
    | "customers-top";
  label: string;
}> = [
  { value: "dashboard-summary", label: "خلاصه داشبورد" },
  { value: "revenue-by-day", label: "درآمد روزانه" },
  { value: "revenue-by-method", label: "درآمد بر اساس روش پرداخت" },
  { value: "revenue-by-service", label: "درآمد بر اساس خدمت" },
  { value: "staff-performance", label: "عملکرد پرسنل" },
  { value: "customers-top", label: "مشتریان برتر" },
];
