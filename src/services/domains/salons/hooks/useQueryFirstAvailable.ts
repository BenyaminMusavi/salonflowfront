import { useQuery } from "@tanstack/react-query";
import salonService from "../salon.service";

export const FIRST_AVAILABLE_QUERY_KEY = "FIRST_AVAILABLE_QUERY_KEY";

/** Booking «اولین نوبت»: earliest free slot for the chosen services (data is null when none). */
export const useQueryFirstAvailable = (params: {
  salonPublicId: string | undefined;
  branchPublicId: string | null;
  offeringPublicIds: string[];
  enabled: boolean;
}) => {
  const ids = [...params.offeringPublicIds].filter(Boolean).sort();
  return useQuery({
    queryKey: [FIRST_AVAILABLE_QUERY_KEY, params.salonPublicId, params.branchPublicId, ids],
    queryFn: () =>
      salonService.getFirstAvailable({
        salonPublicId: params.salonPublicId!,
        branchPublicId: params.branchPublicId!,
        offeringPublicIds: ids,
      }),
    enabled:
      params.enabled && !!params.salonPublicId && !!params.branchPublicId && ids.length > 0,
    retry: false,
    // A "first free slot" goes stale fast — always re-ask when the option is picked again.
    staleTime: 0,
    gcTime: 0,
  });
};
