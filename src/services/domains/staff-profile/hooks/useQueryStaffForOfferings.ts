import { useQuery } from "@tanstack/react-query";
import staffProfileService from "@/services/domains/staff-profile/staff-profile.service";

export const STAFF_FOR_OFFERINGS_QUERY_KEY = "STAFF_FOR_OFFERINGS_QUERY_KEY";

/**
 * Customer booking passes Guid offeringPublicIds.
 * Salon dashboard may still pass numeric catalog offering ids until that surface is Guid-migrated.
 */
export const useQueryStaffForOfferings = (
  salonPublicId: string | number | undefined,
  offeringPublicIds: Array<string | number>,
  options?: { enabled?: boolean }
) => {
  const ids = [...offeringPublicIds]
    .filter((id) => id !== "" && id != null)
    .map(String)
    .sort();

  return useQuery({
    queryKey: [STAFF_FOR_OFFERINGS_QUERY_KEY, salonPublicId, ids],
    queryFn: () =>
      staffProfileService.getStaffForOfferings(salonPublicId!, ids),
    enabled:
      salonPublicId != null &&
      salonPublicId !== "" &&
      ids.length > 0 &&
      (options?.enabled ?? true),
  });
};
