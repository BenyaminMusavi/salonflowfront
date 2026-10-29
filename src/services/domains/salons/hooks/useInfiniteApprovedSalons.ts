import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import salonService from "../salon.service";
import { IGetApprovedSalonsParams } from "../types/salons.type";
import { SALON_APPROVED_QUERY_KEY } from "./useQueryApprovedSalons";

/** Search page list: pages are appended by «نمایش بیشتر» (`hasNext`), page 1 restarts on any param change. */
export const useInfiniteApprovedSalons = (
  params: Omit<IGetApprovedSalonsParams, "page"> = {}
) => {
  return useInfiniteQuery({
    queryKey: [SALON_APPROVED_QUERY_KEY, "infinite", params],
    queryFn: ({ pageParam }) => salonService.getApproved({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.data?.hasNext ? (last.data.page ?? 1) + 1 : undefined,
    placeholderData: keepPreviousData,
  });
};
