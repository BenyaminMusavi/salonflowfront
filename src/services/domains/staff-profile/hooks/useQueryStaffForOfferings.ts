import { useQuery } from "@tanstack/react-query";
import staffProfileService from "@/services/domains/staff-profile/staff-profile.service";

export const STAFF_FOR_OFFERINGS_QUERY_KEY = "STAFF_FOR_OFFERINGS_QUERY_KEY";

export const useQueryStaffForOfferings = (
  salonPublicId: string | number | undefined,
  offeringIds: number[],
  options?: { enabled?: boolean }
) => {
  const ids = [...offeringIds].filter((id) => id > 0).sort((a, b) => a - b);

  return useQuery({
    queryKey: [STAFF_FOR_OFFERINGS_QUERY_KEY, salonPublicId, ids],
    queryFn: () =>
      staffProfileService.getStaffForOfferings(salonPublicId!, ids),
    enabled:
      !!salonPublicId &&
      ids.length > 0 &&
      (options?.enabled ?? true),
  });
};
