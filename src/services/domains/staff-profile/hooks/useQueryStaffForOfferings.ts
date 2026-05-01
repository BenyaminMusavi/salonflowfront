import { useQuery } from "@tanstack/react-query";
import staffProfileService from "@/services/domains/staff-profile/staff-profile.service";

export const STAFF_FOR_OFFERINGS_QUERY_KEY = "STAFF_FOR_OFFERINGS_QUERY_KEY";

export const useQueryStaffForOfferings = (
  salonId: number,
  offeringIds: number[],
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [STAFF_FOR_OFFERINGS_QUERY_KEY, salonId, offeringIds],
    queryFn: () =>
      staffProfileService.getStaffForOfferings(salonId, offeringIds),
    enabled: offeringIds.length > 0,
    ...options,
  });
};
