import { useQuery } from "@tanstack/react-query";
import serviceService from "../services-type.service";

export const SERVICES_BY_SALON_QUERY_KEY = "SERVICES_BY_SALON_QUERY_KEY";

export const useQueryServicesBySalon = (salonId: number) => {
  return useQuery({
    queryKey: [SERVICES_BY_SALON_QUERY_KEY, salonId],
    queryFn: () => serviceService.getBySalon(salonId),
    enabled: !!salonId,
  });
};