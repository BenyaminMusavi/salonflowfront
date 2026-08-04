import { useQuery } from "@tanstack/react-query";
import subscriptionsService from "../subscriptions.service";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { SubscriptionStatus } from "@/services/common/enums/domain-enums";

export const SUBSCRIPTION_ENTITLEMENT_QUERY_KEY =
  "SUBSCRIPTION_ENTITLEMENT_QUERY_KEY";

const BILLABLE: number[] = [
  SubscriptionStatus.Trialing,
  SubscriptionStatus.Active,
  SubscriptionStatus.Grace,
];

/**
 * Owner entitlement for salon create gate (Phase 6).
 * `canCreateSalon` = entitled AND under maxSalons.
 */
export const useSubscriptionEntitlement = () => {
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);

  const query = useQuery({
    queryKey: [SUBSCRIPTION_ENTITLEMENT_QUERY_KEY],
    queryFn: () => subscriptionsService.getEntitlement(),
    enabled: isLoggedIn,
  });

  const entitlement = query.data?.data;

  const isEntitled = !!entitlement?.isEntitled;
  const maxSalons = entitlement?.maxSalons ?? 0;
  const ownedSalonCount = entitlement?.ownedSalonCount ?? 0;
  const status = entitlement?.status ?? null;
  const isBillable =
    status != null && BILLABLE.includes(Number(status));

  const canCreateSalon =
    isLoggedIn && isEntitled && ownedSalonCount < maxSalons;

  const remainingSalonSlots = Math.max(0, maxSalons - ownedSalonCount);

  return {
    ...query,
    entitlement,
    isEntitled,
    isBillable,
    maxSalons,
    ownedSalonCount,
    remainingSalonSlots,
    canCreateSalon,
    status,
  };
};
