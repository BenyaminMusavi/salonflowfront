import { useQuery } from "@tanstack/react-query";
import salonService from "../salon.service";

export const STAFF_ROSTER_QUERY_KEY = "STAFF_ROSTER_QUERY_KEY";

export const useQueryStaffRoster = (salonPublicId: string | undefined) => {
  return useQuery({
    queryKey: [STAFF_ROSTER_QUERY_KEY, salonPublicId],
    queryFn: () => salonService.getStaff(salonPublicId!),
    enabled: !!salonPublicId,
  });
};
