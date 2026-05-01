import { useQuery } from "@tanstack/react-query";
import salonOfferingService from "@/services/domains/salon-offering/salon-offering-service";

export const SALON_OFFERINGS_QUERY_KEY = "SALON_OFFERINGS_QUERY_KEY";

export const useQuerySalonOfferings = (
  salonId: number,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [SALON_OFFERINGS_QUERY_KEY, salonId],
    queryFn: () => salonOfferingService.getBySalonId(salonId),
    enabled: options?.enabled ?? true,
  });
};
