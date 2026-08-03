import { useQuery } from "@tanstack/react-query";
import salonService from "../salon.service";

export const AVAILABLE_DATES_QUERY_KEY = "AVAILABLE_DATES_QUERY_KEY";

export const useQueryAvailableDates = (
  branchId: number | null,
  serviceTypeId: number | null
) => {
  return useQuery({
    queryKey: [AVAILABLE_DATES_QUERY_KEY, branchId, serviceTypeId],
    queryFn: () =>
      salonService.getAvailableDates(branchId!, serviceTypeId!),
    enabled:
      typeof branchId === "number" &&
      branchId > 0 &&
      typeof serviceTypeId === "number" &&
      serviceTypeId > 0,
  });
};
