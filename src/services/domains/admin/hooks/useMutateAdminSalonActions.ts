import { useMutation, useQueryClient } from "@tanstack/react-query";
import adminService from "@/services/domains/admin/admin.service";
import { IRejectSalonRequest } from "@/services/domains/admin/types/admin.type";
import { ADMIN_SALONS_QUERY_KEY } from "./useQueryAdminSalons";
import { ADMIN_SALON_DETAIL_QUERY_KEY } from "./useQueryAdminSalonDetail";
import { ADMIN_DASHBOARD_SUMMARY_QUERY_KEY } from "./useQueryAdminDashboardSummary";

function useInvalidateAfterModeration() {
  const queryClient = useQueryClient();
  return (publicId: string) => {
    queryClient.invalidateQueries({ queryKey: [ADMIN_SALONS_QUERY_KEY] });
    queryClient.invalidateQueries({
      queryKey: [ADMIN_SALON_DETAIL_QUERY_KEY, publicId],
    });
    queryClient.invalidateQueries({
      queryKey: [ADMIN_DASHBOARD_SUMMARY_QUERY_KEY],
    });
  };
}

export const useMutateApproveSalon = () => {
  const invalidate = useInvalidateAfterModeration();

  return useMutation({
    mutationFn: (publicId: string) => adminService.approveSalon(publicId),
    onSuccess: (_data, publicId) => invalidate(publicId),
  });
};

export const useMutateRejectSalon = () => {
  const invalidate = useInvalidateAfterModeration();

  return useMutation({
    mutationFn: ({
      publicId,
      data,
    }: {
      publicId: string;
      data: IRejectSalonRequest;
    }) => adminService.rejectSalon(publicId, data),
    onSuccess: (_data, { publicId }) => invalidate(publicId),
  });
};
