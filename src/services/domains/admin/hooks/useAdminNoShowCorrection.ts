import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import adminService from "@/services/domains/admin/admin.service";
import type { IRevertNoShowRequest } from "@/services/domains/admin/types/admin.type";

export const ADMIN_NO_SHOW_REVIEW_QUERY_KEY = "ADMIN_NO_SHOW_REVIEW_QUERY_KEY";

/**
 * Read-only review of one appointment before a no-show is corrected. Never cached: it is the basis of a
 * money-affecting decision, so every lookup must show the server's current state.
 */
export const useQueryAdminNoShowReview = (appointmentPublicId: string | null) =>
  useQuery({
    queryKey: [ADMIN_NO_SHOW_REVIEW_QUERY_KEY, appointmentPublicId],
    queryFn: () => adminService.getNoShowReview(appointmentPublicId as string),
    enabled: !!appointmentPublicId,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });

export const useMutateAdminRevertNoShow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentPublicId,
      data,
    }: {
      appointmentPublicId: string;
      data: IRevertNoShowRequest;
    }) => adminService.revertNoShow(appointmentPublicId, data),
    onSuccess: (_result, { appointmentPublicId }) => {
      // The corrected appointment is no longer a no-show: drop the stale review.
      queryClient.removeQueries({ queryKey: [ADMIN_NO_SHOW_REVIEW_QUERY_KEY, appointmentPublicId] });
    },
  });
};
