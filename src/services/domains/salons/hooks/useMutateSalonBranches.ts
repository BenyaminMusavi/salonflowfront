import { useMutation, useQueryClient } from "@tanstack/react-query";
import salonService from "../salon.service";
import { IOnboardingBranch } from "../types/onboarding.type";
import { SALON_BY_ID_QUERY_KEY } from "./useQuerySalonById";

export type SaveSalonBranchesVars = {
  salonPublicId: string;
  branches: IOnboardingBranch[];
};

export const useMutateSalonBranches = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ salonPublicId, branches }: SaveSalonBranchesVars) =>
      salonService.saveBranches(salonPublicId, branches),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({
        queryKey: [SALON_BY_ID_QUERY_KEY, variables.salonPublicId],
      });
      queryClient.invalidateQueries({
        queryKey: [SALON_BY_ID_QUERY_KEY],
      });
    },
  });
};
