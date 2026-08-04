import { useMutation, useQueryClient } from "@tanstack/react-query";
import salonService from "../salon.service";
import { ISaveBasicInfoRequest } from "../types/onboarding.type";
import { SALON_BY_ID_QUERY_KEY } from "./useQuerySalonById";

export const useMutateSalonBasicInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ISaveBasicInfoRequest) => salonService.saveBasicInfo(body),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({
        queryKey: [SALON_BY_ID_QUERY_KEY, variables.publicId],
      });
      queryClient.invalidateQueries({
        queryKey: [SALON_BY_ID_QUERY_KEY],
      });
    },
  });
};
