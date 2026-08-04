import { useQuery } from "@tanstack/react-query";
import subscriptionsService from "../subscriptions.service";

export const SUBSCRIPTION_PLANS_QUERY_KEY = "SUBSCRIPTION_PLANS_QUERY_KEY";

export const useQuerySubscriptionPlans = () => {
  return useQuery({
    queryKey: [SUBSCRIPTION_PLANS_QUERY_KEY],
    queryFn: () => subscriptionsService.getPlans(),
  });
};
