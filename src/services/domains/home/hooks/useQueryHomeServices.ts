import { useQuery } from "@tanstack/react-query";
import homeService from "../home.service";

export const HOME_SERVICES_QUERY_KEY = "HOME_SERVICES_QUERY_KEY";

export const useQueryHomeServices = () => {
  return useQuery({
    queryKey: [HOME_SERVICES_QUERY_KEY],
    queryFn: () => homeService.getServices(),
  });
};