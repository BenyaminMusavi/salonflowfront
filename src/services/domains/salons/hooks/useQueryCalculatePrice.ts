import { useQuery } from "@tanstack/react-query";
import salonService from "../salon.service";

export const CALCULATE_PRICE_QUERY_KEY = "CALCULATE_PRICE_QUERY_KEY";

export const useQueryCalculatePrice = (
  branchId: number | null,
  serviceTypeIds: number[],
  staffPublicId?: string | null,
  enabled = true
) => {
  const ids = [...serviceTypeIds].filter((id) => id > 0).sort((a, b) => a - b);

  return useQuery({
    queryKey: [CALCULATE_PRICE_QUERY_KEY, branchId, ids, staffPublicId ?? null],
    queryFn: () =>
      salonService.calculatePrice(branchId!, ids, staffPublicId),
    enabled:
      enabled &&
      typeof branchId === "number" &&
      branchId > 0 &&
      ids.length > 0,
  });
};
