import {
  PlanCampaignDiscountType,
  PlatformInvoiceStatus,
  PromoDiscountType,
  SubscriptionStatus,
} from "@/services/common/enums/domain-enums";
import { BadgeProps } from "@/shared/components/primitives/badge/Badge";
import { formatToman } from "@/shared/utils/salonDisplay";

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

/** Shared by campaigns and promo codes — both use the same Percentage/FixedAmount shape. */
export function formatDiscountValue(
  discountType: PlanCampaignDiscountType | PromoDiscountType,
  value: number
): string {
  if (discountType === PlanCampaignDiscountType.Percentage) {
    return `${value.toLocaleString("fa-IR")}٪`;
  }
  return `${formatToman(value)} تومان`;
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
