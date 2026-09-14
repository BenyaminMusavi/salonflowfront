import { useMutation, useQueryClient } from "@tanstack/react-query";
import salonReportsService from "../salon-reports.service";
import { IAdminSalonReportNotesRequest } from "../types/salon-reports.type";
import { ADMIN_PENDING_SALON_REPORTS_QUERY_KEY } from "./useQueryAdminPendingSalonReports";
import { ADMIN_DASHBOARD_SUMMARY_QUERY_KEY } from "@/services/domains/admin/hooks/useQueryAdminDashboardSummary";

function useInvalidatePendingReports() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({
      queryKey: [ADMIN_PENDING_SALON_REPORTS_QUERY_KEY],
    });
    queryClient.invalidateQueries({ queryKey: [ADMIN_DASHBOARD_SUMMARY_QUERY_KEY] });
  };
}

export const useMutateInvestigateSalonReport = () => {
  const invalidate = useInvalidatePendingReports();
  return useMutation({
    mutationFn: (id: number) => salonReportsService.investigate(id),
    onSuccess: invalidate,
  });
};

export const useMutateResolveSalonReport = () => {
  const invalidate = useInvalidatePendingReports();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IAdminSalonReportNotesRequest }) =>
      salonReportsService.resolve(id, data),
    onSuccess: invalidate,
  });
};

export const useMutateDismissSalonReport = () => {
  const invalidate = useInvalidatePendingReports();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IAdminSalonReportNotesRequest }) =>
      salonReportsService.dismiss(id, data),
    onSuccess: invalidate,
  });
};
