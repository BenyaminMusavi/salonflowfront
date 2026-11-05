import { useQuery } from "@tanstack/react-query";
import locationsService from "../locations.service";

export const LOCATIONS_QUERY_KEY = "LOCATIONS_QUERY_KEY";

// Reference data changes only when the team loads new data by hand: keep it for a long while.
const REFERENCE_STALE_MS = 60 * 60 * 1000;

export const useQueryProvinces = (enabled = true) =>
  useQuery({
    queryKey: [LOCATIONS_QUERY_KEY, "provinces"],
    queryFn: () => locationsService.provinces(),
    enabled,
    staleTime: REFERENCE_STALE_MS,
  });

/** With a province: all its cities. Without: `search` across the country, or the biggest cities when empty. */
export const useQueryCities = (params: { provincePublicId?: string | null; search?: string }, enabled = true) =>
  useQuery({
    queryKey: [LOCATIONS_QUERY_KEY, "cities", params.provincePublicId ?? null, params.search?.trim() ?? ""],
    queryFn: () => locationsService.cities({ provincePublicId: params.provincePublicId ?? undefined, search: params.search }),
    enabled,
    staleTime: REFERENCE_STALE_MS,
  });

export const useQueryDistricts = (cityPublicId: string | null | undefined, enabled = true) =>
  useQuery({
    queryKey: [LOCATIONS_QUERY_KEY, "districts", cityPublicId],
    queryFn: () => locationsService.districts(cityPublicId!),
    enabled: enabled && !!cityPublicId,
    staleTime: REFERENCE_STALE_MS,
  });
