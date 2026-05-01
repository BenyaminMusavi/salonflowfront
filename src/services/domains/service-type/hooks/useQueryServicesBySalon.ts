import { useQuery } from "@tanstack/react-query";
import serviceTypeService from "../services-type.service";

export const SERVICES_BY_SALON_QUERY_KEY =
  "SERVICES_BY_SALON_QUERY_KEY";

export const useQueryServicesBySalon = (salonId: number) => {
  return useQuery({
    queryKey: [SERVICES_BY_SALON_QUERY_KEY, salonId],
    queryFn: () =>
      serviceTypeService.getServicesBySalon(salonId),
    enabled: !!salonId,
  });
};