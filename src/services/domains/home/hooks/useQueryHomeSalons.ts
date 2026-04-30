import { useQuery } from "@tanstack/react-query";
import homeService from "../home.service";

export const HOME_SALONS_QUERY_KEY = "HOME_SALONS_QUERY_KEY";

export const useQueryHomeSalons = () => {
  return useQuery({
    queryKey: [HOME_SALONS_QUERY_KEY],
    queryFn: () => homeService.getSalons(),
  });
};