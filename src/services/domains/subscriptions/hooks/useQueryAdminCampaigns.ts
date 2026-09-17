import { useQuery } from "@tanstack/react-query";
import subscriptionsService from "../subscriptions.service";

export const ADMIN_CAMPAIGNS_QUERY_KEY = "ADMIN_CAMPAIGNS_QUERY_KEY";

export const useQueryAdminCampaigns = (planId?: number) => {
  return useQuery({
    queryKey: [ADMIN_CAMPAIGNS_QUERY_KEY, planId],
    queryFn: () => subscriptionsService.listCampaigns(planId),
  });
};
