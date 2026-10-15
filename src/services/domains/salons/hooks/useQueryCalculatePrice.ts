import { useQuery } from "@tanstack/react-query";
import salonService from "../salon.service";

export const CALCULATE_PRICE_QUERY_KEY = "CALCULATE_PRICE_QUERY_KEY";

export const useQueryCalculatePrice = (
  branchPublicId: string | null,
  serviceTypePublicIds: string[],
  staffPublicId?: string | null,
  enabled = true,
  startTime?: string | null
) => {
  const ids = [...serviceTypePublicIds].filter(Boolean).sort();

  return useQuery({
    queryKey: [
      CALCULATE_PRICE_QUERY_KEY,
      branchPublicId,
      ids,
      staffPublicId ?? null,
      startTime ?? null,
    ],
    queryFn: () =>
      salonService.calculatePrice(branchPublicId!, ids, staffPublicId, startTime),
    enabled: enabled && !!branchPublicId && ids.length > 0,
  });
};
