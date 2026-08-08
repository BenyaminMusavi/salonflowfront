import { useQuery } from "@tanstack/react-query";
import salonService from "../salon.service";

export const STAFF_AVAILABILITY_QUERY_KEY = "STAFF_AVAILABILITY_QUERY_KEY";

export const useQueryStaffAvailability = (
  branchPublicId: string | null,
  serviceTypePublicId: string | null,
  date: string | null
) => {
  return useQuery({
    queryKey: [
      STAFF_AVAILABILITY_QUERY_KEY,
      branchPublicId,
      serviceTypePublicId,
      date,
    ],
    queryFn: () =>
      salonService.getStaffAvailability(
        branchPublicId!,
        serviceTypePublicId!,
        date!
      ),
    enabled: !!branchPublicId && !!serviceTypePublicId && !!date,
  });
};
