import { useQuery } from "@tanstack/react-query";
import reviewsService from "../reviews.service";

export const ADMIN_PENDING_REVIEWS_QUERY_KEY = "ADMIN_PENDING_REVIEWS_QUERY_KEY";

export const useQueryAdminPendingReviews = (params: {
  page?: number;
  pageSize?: number;
}) => {
  return useQuery({
    queryKey: [ADMIN_PENDING_REVIEWS_QUERY_KEY, params.page ?? 1, params.pageSize ?? 20],
    queryFn: () => reviewsService.listPending(params),
  });
};
