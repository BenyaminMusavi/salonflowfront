import { useQuery } from "@tanstack/react-query";
import salonService from "../salon.service";

export const AVAILABLE_DATES_QUERY_KEY = "AVAILABLE_DATES_QUERY_KEY";

/**
 * Booking calendar. Never cached (backend contract): every visit to the date step re-asks,
 * since capacity changes as other customers book.
 */
export const useQueryAvailableDates = (
  branchPublicId: string | null,
  offeringPublicIds: string[],
  /** Narrows the calendar to one staff member's days; omit for "any staff". */
  staffPublicId?: string | null,
  options?: { enabled?: boolean }
) => {
  const ids = [...offeringPublicIds].filter(Boolean).sort();
  return useQuery({
    queryKey: [AVAILABLE_DATES_QUERY_KEY, branchPublicId, ids, staffPublicId ?? null],
    queryFn: () => salonService.getAvailableDates(branchPublicId!, ids, staffPublicId),
    enabled: !!branchPublicId && ids.length > 0 && (options?.enabled ?? true),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
};
