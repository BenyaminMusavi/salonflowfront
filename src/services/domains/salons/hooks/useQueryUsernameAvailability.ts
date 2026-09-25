import { useQuery } from "@tanstack/react-query";
import salonService from "../salon.service";

export const USERNAME_AVAILABILITY_QUERY_KEY = "USERNAME_AVAILABILITY_QUERY_KEY";

/** Live "is this username free?" check. Callers pass an already-debounced value. */
export const useQueryUsernameAvailability = (
  username: string,
  salonPublicId?: string | null,
  enabled = true
) => {
  return useQuery({
    queryKey: [USERNAME_AVAILABILITY_QUERY_KEY, username, salonPublicId ?? null],
    queryFn: () => salonService.checkUsernameAvailability(username, salonPublicId),
    enabled: enabled && !!username,
    staleTime: 30_000,
    retry: false,
  });
};
