import { useQuery } from "@tanstack/react-query";
import reviewsService from "../reviews.service";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";

export const REVIEW_BY_ID_QUERY_KEY = "REVIEW_BY_ID_QUERY_KEY";

export const useQueryReviewById = (id: number | undefined) => {
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);

  return useQuery({
    queryKey: [REVIEW_BY_ID_QUERY_KEY, id],
    queryFn: () => reviewsService.getById(id!),
    enabled: isLoggedIn && typeof id === "number" && id > 0,
  });
};
