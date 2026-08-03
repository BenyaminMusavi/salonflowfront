import { useQuery } from "@tanstack/react-query";
import salonService from "../salon.service";

export const STAFF_AVAILABILITY_QUERY_KEY = "STAFF_AVAILABILITY_QUERY_KEY";

export const useQueryStaffAvailability = (
  branchId: number | null,
  serviceTypeId: number | null,
  date: string | null
) => {
  return useQuery({
    queryKey: [STAFF_AVAILABILITY_QUERY_KEY, branchId, serviceTypeId, date],
    queryFn: () =>
      salonService.getStaffAvailability(branchId!, serviceTypeId!, date!),
    enabled:
      typeof branchId === "number" &&
      branchId > 0 &&
      typeof serviceTypeId === "number" &&
      serviceTypeId > 0 &&
      !!date,
  });
};
