import { useQuery } from "@tanstack/react-query";
import reviewsService from "../reviews.service";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";

export const REVIEW_BY_ID_QUERY_KEY = "REVIEW_BY_ID_QUERY_KEY";
export const MY_REVIEW_FOR_APPOINTMENT_QUERY_KEY = "MY_REVIEW_FOR_APPOINTMENT_QUERY_KEY";

/** The logged-in customer's own review of one appointment — the server is the source of truth, not the browser. */
export const useQueryMyReviewForAppointment = (appointmentId: number | undefined) => {
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);

  return useQuery({
    queryKey: [MY_REVIEW_FOR_APPOINTMENT_QUERY_KEY, appointmentId],
    queryFn: () => reviewsService.getMineForAppointment(appointmentId!),
    enabled: isLoggedIn && typeof appointmentId === "number" && appointmentId > 0,
  });
};

export const useQueryReviewById = (id: number | undefined) => {
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);

  return useQuery({
    queryKey: [REVIEW_BY_ID_QUERY_KEY, id],
    queryFn: () => reviewsService.getById(id!),
    enabled: isLoggedIn && typeof id === "number" && id > 0,
  });
};
