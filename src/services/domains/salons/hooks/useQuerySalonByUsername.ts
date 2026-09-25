import { useQuery } from "@tanstack/react-query";
import salonService from "../salon.service";

export const SALON_BY_USERNAME_QUERY_KEY = "SALON_BY_USERNAME_QUERY_KEY";

export const useQuerySalonByUsername = (username: string | undefined) => {
  return useQuery({
    queryKey: [SALON_BY_USERNAME_QUERY_KEY, username],
    queryFn: () => salonService.getByUsername(username!),
    enabled: !!username,
    // 404 = unknown/unpublished username — retrying won't change that.
    retry: (failureCount, error) =>
      (error as { response?: { status?: number } })?.response?.status !== 404 &&
      failureCount < 2,
  });
};
