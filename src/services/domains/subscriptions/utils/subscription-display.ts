import { SubscriptionStatus } from "@/services/common/enums/domain-enums";

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
