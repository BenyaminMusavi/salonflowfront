import { useQuery } from "@tanstack/react-query";
import salonService from "../salon.service";

export const BRANCH_SERVICES_QUERY_KEY = "BRANCH_SERVICES_QUERY_KEY";

export const useQueryBranchServices = (branchPublicId: string | null) => {
  return useQuery({
    queryKey: [BRANCH_SERVICES_QUERY_KEY, branchPublicId],
    queryFn: () => salonService.getBranchServices(branchPublicId!),
    enabled: !!branchPublicId,
  });
};
