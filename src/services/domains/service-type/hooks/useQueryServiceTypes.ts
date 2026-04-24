import { useQuery } from "@tanstack/react-query";
import serviceTypeService from "@/services/domains/service-type/services-type.service";

export const SERVICE_TYPE_QUERY_KEY = "SERVICE_TYPE_QUERY_KEY";

export const useQueryServiceTypes = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [SERVICE_TYPE_QUERY_KEY],
    queryFn: () => serviceTypeService.getAll(),
    ...options,
  });
};
