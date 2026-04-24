import { useQuery } from "@tanstack/react-query";
import salonService from "../salon.service";

export const SALON_APPROVED_QUERY_KEY = "SALON_APPROVED_QUERY_KEY";

export const useQueryApprovedSalons = () => {
  return useQuery({
    queryKey: [SALON_APPROVED_QUERY_KEY],
    queryFn: () => salonService.getApproved(),
  });
};