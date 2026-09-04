import { useMutation, useQueryClient } from "@tanstack/react-query";
import salonService from "../salon.service";
import { SALON_BY_ID_QUERY_KEY } from "./useQuerySalonById";

/** Re-submits a Draft/Rejected salon for admin review (server also flips Rejected -> Draft -> Pending). */
export const useMutateSubmitForReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (salonPublicId: string) => salonService.submitForReview(salonPublicId),
    onSuccess: (_res, salonPublicId) => {
      queryClient.invalidateQueries({
        queryKey: [SALON_BY_ID_QUERY_KEY, salonPublicId],
      });
      queryClient.invalidateQueries({
        queryKey: [SALON_BY_ID_QUERY_KEY],
      });
    },
  });
};
