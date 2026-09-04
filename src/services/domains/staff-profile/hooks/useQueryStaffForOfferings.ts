import { useQuery } from "@tanstack/react-query";
import staffProfileService from "@/services/domains/staff-profile/staff-profile.service";

export const STAFF_FOR_OFFERINGS_QUERY_KEY = "STAFF_FOR_OFFERINGS_QUERY_KEY";

/**
 * The backend endpoint requires Guid offeringPublicIds (query is mandatory Guid[]) —
 * every caller, customer booking and salon dashboard alike, must pass ServiceOffering.PublicId,
 * never the numeric catalog offering id (SF-QA-015).
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
