import { useQuery } from "@tanstack/react-query";
import staffService from "../salon.service";

export const STAFF_BY_SALON_QUERY_KEY = "STAFF_BY_SALON_QUERY_KEY";

export const useQueryStaffBySalon = (salonId: number) => {
  return useQuery({
    queryKey: [STAFF_BY_SALON_QUERY_KEY, salonId],
    queryFn: () => staffService.getBySalon(salonId),
    enabled: !!salonId,
  });
};