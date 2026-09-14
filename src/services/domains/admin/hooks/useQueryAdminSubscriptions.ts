import { useQuery } from "@tanstack/react-query";
import adminService from "@/services/domains/admin/admin.service";
import { IAdminSubscriptionsParams } from "@/services/domains/subscriptions/types/subscriptions.type";

export const ADMIN_SUBSCRIPTIONS_QUERY_KEY = "ADMIN_SUBSCRIPTIONS_QUERY_KEY";

export const useQueryAdminSubscriptions = (params: IAdminSubscriptionsParams) => {
  return useQuery({
    queryKey: [ADMIN_SUBSCRIPTIONS_QUERY_KEY, params],
    queryFn: () => adminService.listSubscriptions(params),
  });
};
