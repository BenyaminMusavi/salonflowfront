import { useQuery } from "@tanstack/react-query";
import salonService from "../salon.service";

export const AVAILABLE_DATES_QUERY_KEY = "AVAILABLE_DATES_QUERY_KEY";

export const useQueryAvailableDates = (
  branchPublicId: string | null,
  serviceTypePublicId: string | null,
  /** Narrows the calendar to one staff member's days; omit for "any staff". */
  staffPublicId?: string | null,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [AVAILABLE_DATES_QUERY_KEY, branchPublicId, serviceTypePublicId, staffPublicId ?? null],
    queryFn: () =>
      salonService.getAvailableDates(branchPublicId!, serviceTypePublicId!, staffPublicId),
    enabled: !!branchPublicId && !!serviceTypePublicId && (options?.enabled ?? true),
  });
};
