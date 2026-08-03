import { useQuery } from "@tanstack/react-query";
import reviewsService from "../reviews.service";

export const SALON_REVIEWS_QUERY_KEY = "SALON_REVIEWS_QUERY_KEY";

export const useQuerySalonReviews = (
  salonId: number | undefined,
  params?: { page?: number; pageSize?: number }
) => {
  return useQuery({
    queryKey: [
      SALON_REVIEWS_QUERY_KEY,
      salonId,
      params?.page ?? 1,
      params?.pageSize ?? 20,
    ],
    queryFn: () =>
      reviewsService.listBySalon({
        salonId: salonId!,
        page: params?.page,
        pageSize: params?.pageSize,
      }),
    enabled: typeof salonId === "number" && salonId > 0,
  });
};
