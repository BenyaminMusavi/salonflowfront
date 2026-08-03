import { useMutation, useQueryClient } from "@tanstack/react-query";
import reviewsService from "../reviews.service";
import {
  ICreateReviewRequest,
  IEditReviewRequest,
} from "../types/reviews.type";
import { SALON_REVIEWS_QUERY_KEY } from "./useQuerySalonReviews";
import { REVIEW_BY_ID_QUERY_KEY } from "./useQueryReviewById";
import { useMyReviewsStore } from "../store/useMyReviewsStore";

export const useMutateCreateReview = () => {
  const queryClient = useQueryClient();
  const setForAppointment = useMyReviewsStore((s) => s.setForAppointment);

  return useMutation({
    mutationFn: (body: ICreateReviewRequest) => reviewsService.create(body),
    onSuccess: (res, variables) => {
      const review = res.data;
      setForAppointment(variables.appointmentId, {
        reviewId: review.id,
        moderationStatus: review.moderationStatus,
        rating: review.rating,
      });
      queryClient.invalidateQueries({ queryKey: [SALON_REVIEWS_QUERY_KEY] });
      queryClient.setQueryData([REVIEW_BY_ID_QUERY_KEY, review.id], res);
    },
  });
};

export const useMutateEditReview = () => {
  const queryClient = useQueryClient();
  const setForAppointment = useMyReviewsStore((s) => s.setForAppointment);
  const byAppointmentId = useMyReviewsStore((s) => s.byAppointmentId);

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: IEditReviewRequest;
      appointmentId?: number;
    }) => reviewsService.edit(id, body),
    onSuccess: (res, variables) => {
      const review = res.data;
      queryClient.setQueryData([REVIEW_BY_ID_QUERY_KEY, review.id], res);
      queryClient.invalidateQueries({ queryKey: [SALON_REVIEWS_QUERY_KEY] });
      if (variables.appointmentId) {
        setForAppointment(variables.appointmentId, {
          reviewId: review.id,
          moderationStatus: review.moderationStatus,
          rating: review.rating,
        });
      } else {
        const entry = Object.entries(byAppointmentId).find(
          ([, v]) => v.reviewId === review.id
        );
        if (entry) {
          setForAppointment(Number(entry[0]), {
            reviewId: review.id,
            moderationStatus: review.moderationStatus,
            rating: review.rating,
          });
        }
      }
    },
  });
};

export const useMutateDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => reviewsService.remove(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [SALON_REVIEWS_QUERY_KEY] });
      queryClient.removeQueries({ queryKey: [REVIEW_BY_ID_QUERY_KEY, id] });
    },
  });
};
