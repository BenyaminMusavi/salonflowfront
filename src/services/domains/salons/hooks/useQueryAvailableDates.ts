import { useQuery } from "@tanstack/react-query";
import salonService from "../salon.service";

export const AVAILABLE_DATES_QUERY_KEY = "AVAILABLE_DATES_QUERY_KEY";

export const useQueryAvailableDates = (
  branchPublicId: string | null,
  serviceTypePublicId: string | null
) => {
  return useQuery({
    queryKey: [AVAILABLE_DATES_QUERY_KEY, branchPublicId, serviceTypePublicId],
    queryFn: () =>
      salonService.getAvailableDates(branchPublicId!, serviceTypePublicId!),
    enabled: !!branchPublicId && !!serviceTypePublicId,
  });
};
