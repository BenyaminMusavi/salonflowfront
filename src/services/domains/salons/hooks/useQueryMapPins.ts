import { keepPreviousData, useQuery } from "@tanstack/react-query";
import salonService from "../salon.service";
import { IGetMapPinsParams } from "../types/salons.type";

export const SALON_MAP_PINS_QUERY_KEY = "SALON_MAP_PINS_QUERY_KEY";

/**
 * Pins for the visible map box. `params` is null until the map has reported its first bounds.
 * The abort signal is forwarded, so panning on cancels the previous request instead of letting it land late.
 */
export const useQueryMapPins = (params: IGetMapPinsParams | null) => {
  return useQuery({
    queryKey: [SALON_MAP_PINS_QUERY_KEY, params],
    queryFn: ({ signal }) => salonService.getMapPins(params!, signal),
    enabled: params != null,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
};
