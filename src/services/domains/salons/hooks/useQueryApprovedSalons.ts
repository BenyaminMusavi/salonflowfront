import { useQuery } from "@tanstack/react-query";
import salonService from "../salon.service";
import { IGetApprovedSalonsParams } from "../types/salons.type";

export const SALON_APPROVED_QUERY_KEY = "SALON_APPROVED_QUERY_KEY";

export const useQueryApprovedSalons = (params: IGetApprovedSalonsParams = {}) => {
  return useQuery({
    queryKey: [SALON_APPROVED_QUERY_KEY, params],
    queryFn: () => salonService.getApproved(params),
  });
};
