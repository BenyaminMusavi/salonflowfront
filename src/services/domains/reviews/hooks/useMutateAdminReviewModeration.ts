import { useMutation, useQueryClient } from "@tanstack/react-query";
import reviewsService from "../reviews.service";
import { ADMIN_PENDING_REVIEWS_QUERY_KEY } from "./useQueryAdminPendingReviews";
import { ADMIN_DASHBOARD_SUMMARY_QUERY_KEY } from "@/services/domains/admin/hooks/useQueryAdminDashboardSummary";

function useInvalidatePendingReviews() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [ADMIN_PENDING_REVIEWS_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [ADMIN_DASHBOARD_SUMMARY_QUERY_KEY] });
  };
}

export const useMutateApproveReview = () => {
  const invalidate = useInvalidatePendingReviews();
  return useMutation({
    mutationFn: (id: number) => reviewsService.approve(id),
    onSuccess: invalidate,
  });
};

export const useMutateRejectReview = () => {
  const invalidate = useInvalidatePendingReviews();
  return useMutation({
    mutationFn: (id: number) => reviewsService.reject(id),
    onSuccess: invalidate,
  });
};

export const useMutateApproveReviewReply = () => {
  const invalidate = useInvalidatePendingReviews();
  return useMutation({
    mutationFn: (reviewId: number) => reviewsService.approveReply(reviewId),
    onSuccess: invalidate,
  });
};

export const useMutateRejectReviewReply = () => {
  const invalidate = useInvalidatePendingReviews();
  return useMutation({
    mutationFn: (reviewId: number) => reviewsService.rejectReply(reviewId),
    onSuccess: invalidate,
  });
};
