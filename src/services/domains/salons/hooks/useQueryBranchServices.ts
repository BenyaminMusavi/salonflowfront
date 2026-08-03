import { useQuery } from "@tanstack/react-query";
import salonService from "../salon.service";

export const BRANCH_SERVICES_QUERY_KEY = "BRANCH_SERVICES_QUERY_KEY";

export const useQueryBranchServices = (branchId: number | null) => {
  return useQuery({
    queryKey: [BRANCH_SERVICES_QUERY_KEY, branchId],
    queryFn: () => salonService.getBranchServices(branchId!),
    enabled: typeof branchId === "number" && branchId > 0,
  });
};
