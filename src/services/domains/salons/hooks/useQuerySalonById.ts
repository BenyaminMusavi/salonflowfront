import { useQuery } from "@tanstack/react-query";
import salonService from "../salon.service";

export const SALON_BY_ID_QUERY_KEY = "SALON_BY_ID_QUERY_KEY";

export const useQuerySalonById = (id: number) => {
  return useQuery({
    queryKey: [SALON_BY_ID_QUERY_KEY, id],
    queryFn: () => salonService.getById(id),
    enabled: !!id,
  });
};
