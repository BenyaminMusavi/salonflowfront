import { useQuery } from "@tanstack/react-query";
import serviceTypeService from "../services-type.service";

export const useQueryServicesBySalon = (salonId: number) => {
  return useQuery({
    queryKey: ["SERVICES_BY_SALON", salonId],
    queryFn: () => serviceTypeService.getServicesBySalon(salonId),
    enabled: !!salonId,
  });
};