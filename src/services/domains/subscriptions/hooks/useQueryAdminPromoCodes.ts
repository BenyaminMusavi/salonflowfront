import { useQuery } from "@tanstack/react-query";
import subscriptionsService from "../subscriptions.service";

export const ADMIN_PROMO_CODES_QUERY_KEY = "ADMIN_PROMO_CODES_QUERY_KEY";

export const useQueryAdminPromoCodes = (planId?: number) => {
  return useQuery({
    queryKey: [ADMIN_PROMO_CODES_QUERY_KEY, planId],
    queryFn: () => subscriptionsService.listPromos(planId),
  });
};
