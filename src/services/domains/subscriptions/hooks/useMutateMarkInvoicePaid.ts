import { useMutation, useQueryClient } from "@tanstack/react-query";
import subscriptionsService from "../subscriptions.service";
import { IMarkInvoicePaidRequest } from "../types/subscriptions.type";
import { ADMIN_SUBSCRIPTION_INVOICES_QUERY_KEY } from "@/services/domains/admin/hooks/useQueryAdminSubscriptionInvoices";
import { ADMIN_SUBSCRIPTIONS_QUERY_KEY } from "@/services/domains/admin/hooks/useQueryAdminSubscriptions";

export const useMutateMarkInvoicePaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invoiceId,
      data,
    }: {
      invoiceId: number;
      data: IMarkInvoicePaidRequest;
    }) => subscriptionsService.markInvoicePaid(invoiceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_SUBSCRIPTION_INVOICES_QUERY_KEY],
      });
      queryClient.invalidateQueries({ queryKey: [ADMIN_SUBSCRIPTIONS_QUERY_KEY] });
    },
  });
};
