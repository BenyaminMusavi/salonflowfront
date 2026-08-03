import { useQuery } from "@tanstack/react-query";
import salonOfferingService from "../salon-offering-service";

export const SALON_OFFERINGS_QUERY_KEY = "SALON_OFFERINGS_QUERY_KEY";

export const useQuerySalonOfferings = (
  salonId: number,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [SALON_OFFERINGS_QUERY_KEY, salonId],
    queryFn: () => salonOfferingService.getBySalonId(salonId),
    enabled: salonId > 0 && (options?.enabled ?? true),
  });
};
