import { useQuery } from "@tanstack/react-query";
import adminService from "@/services/domains/admin/admin.service";
import { IAdminPlatformInvoicesParams } from "@/services/domains/subscriptions/types/subscriptions.type";

export const ADMIN_SUBSCRIPTION_INVOICES_QUERY_KEY =
  "ADMIN_SUBSCRIPTION_INVOICES_QUERY_KEY";

export const useQueryAdminSubscriptionInvoices = (
  params: IAdminPlatformInvoicesParams
) => {
  return useQuery({
    queryKey: [ADMIN_SUBSCRIPTION_INVOICES_QUERY_KEY, params],
    queryFn: () => adminService.listSubscriptionInvoices(params),
  });
};
