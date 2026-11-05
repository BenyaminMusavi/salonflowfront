import { useQuery } from "@tanstack/react-query";
import amenitiesService from "../amenities.service";

export const AMENITIES_QUERY_KEY = "AMENITIES_QUERY_KEY";

// Reference data that changes only with a backend release: keep it for a long while.
const REFERENCE_STALE_MS = 60 * 60 * 1000;

export const useQueryAmenities = (enabled = true) =>
  useQuery({
    queryKey: [AMENITIES_QUERY_KEY],
    queryFn: () => amenitiesService.list(),
    enabled,
    staleTime: REFERENCE_STALE_MS,
  });
