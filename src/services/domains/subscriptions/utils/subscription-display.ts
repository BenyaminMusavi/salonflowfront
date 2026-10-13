import {
  PlatformInvoiceStatus,
  PromoDiscountType,
  SubscriptionStatus,
} from "@/services/common/enums/domain-enums";
import { BadgeProps } from "@/shared/components/primitives/badge/Badge";
import { formatToman } from "@/shared/utils/salonDisplay";
import { APP_LOCALE } from "@/shared/utils/locale";

export function subscriptionStatusLabel(status: number | null | undefined): string {
  switch (status) {
    case SubscriptionStatus.Trialing:
      return "دوره آزمایشی";
    case SubscriptionStatus.Active:
      return "فعال";
    case SubscriptionStatus.Grace:
      return "مهلت پرداخت";
    case SubscriptionStatus.PastDue:
      return "معوق";
    case SubscriptionStatus.Canceled:
      return "لغو شده";
    case SubscriptionStatus.Expired:
      return "منقضی";
    case SubscriptionStatus.Suspended:
      return "معلق";
    case SubscriptionStatus.PendingStart:
      return "در انتظار شروع";
    default:
      return "بدون اشتراک";
  }
}

export function subscriptionStatusVariant(
  status: number | null | undefined
): NonNullable<BadgeProps["variant"]> {
  switch (status) {
    case SubscriptionStatus.Active:
      return "success";
    case SubscriptionStatus.Trialing:
    case SubscriptionStatus.PendingStart:
      return "brand";
    case SubscriptionStatus.Grace:
    case SubscriptionStatus.PastDue:
      return "warning";
    case SubscriptionStatus.Canceled:
    case SubscriptionStatus.Expired:
    case SubscriptionStatus.Suspended:
      return "error";
    default:
      return "default";
  }
}

export function platformInvoiceStatusLabel(status: number | null | undefined): string {
  switch (status) {
    case PlatformInvoiceStatus.Pending:
      return "در انتظار پرداخت";
    case PlatformInvoiceStatus.Paid:
      return "پرداخت‌شده";
    case PlatformInvoiceStatus.Cancelled:
      return "لغو شده";
    case PlatformInvoiceStatus.Expired:
      return "منقضی";
    default:
      return "نامشخص";
  }
}

export function platformInvoiceStatusVariant(
  status: number | null | undefined
): NonNullable<BadgeProps["variant"]> {
  switch (status) {
    case PlatformInvoiceStatus.Paid:
      return "success";
    case PlatformInvoiceStatus.Pending:
      return "warning";
    case PlatformInvoiceStatus.Cancelled:
    case PlatformInvoiceStatus.Expired:
      return "error";
    default:
      return "default";
  }
}

export function effectivePlanPrice(plan: {
  price: number;
  campaignPrice?: number | null;
}): number {
  if (
    typeof plan.campaignPrice === "number" &&
    Number.isFinite(plan.campaignPrice) &&
    plan.campaignPrice < plan.price
  ) {
    return plan.campaignPrice;
  }
  return plan.price;
}

/*
 * Subscription money (plans, discounts, checkout, platform invoices, promo fixed amounts, platform
 * reports) is in RIALS in the API, while the UI speaks Toman. Convert only at the edges:
 * rialToToman for display, tomanToRial for what an admin types into a form.
 */
export function rialToToman(rial: number): number {
  return Math.round(rial / 10);
}

export function tomanToRial(toman: number): number {
  return Math.round(toman * 10);
}

/** "1,000,000" from a rial amount (no currency word — callers append «تومان»). */
export function formatRialAsToman(rial: number | null | undefined): string {
  return rial == null || !Number.isFinite(rial) ? "—" : formatToman(rialToToman(rial));
}

/** Promo codes: percentage, or a fixed amount stored in RIALS and shown in Toman. */
export function formatDiscountValue(discountType: PromoDiscountType, value: number): string {
  if (discountType === PromoDiscountType.Percentage) {
    return `${value.toLocaleString(APP_LOCALE)}٪`;
  }
  return `${formatRialAsToman(value)} تومان`;
}

/** Free launch: the whole price is waived and `finalPrice` is 0. */
export const LAUNCH_FREE_LABEL = "رایگان در دوران راه‌اندازی";

/** Buying again is blocked only while the first purchase waits for salon approval. */
export function canPurchaseSubscription(status: number | null | undefined): boolean {
  return status !== SubscriptionStatus.PendingStart;
}

/** «لغو شده ولی هنوز فعال» — cancelled, but the paid period has not ended yet. */
export function isCancelScheduled(sub: {
  status: number;
  cancelAtPeriodEnd?: boolean;
}): boolean {
  return !!sub.cancelAtPeriodEnd && sub.status === SubscriptionStatus.Active;
}

/** Whole days left until `endDate`, or null if there is no end date to count down to. */
export function remainingSubscriptionDays(
  endDate: string | null | undefined
): number | null {
  if (!endDate) return null;
  const end = new Date(endDate).getTime();
  if (Number.isNaN(end)) return null;
  return Math.max(0, Math.ceil((end - Date.now()) / 86_400_000));
}
