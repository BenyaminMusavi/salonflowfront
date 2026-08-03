import { useQuery } from "@tanstack/react-query";
import authService from "@/services/domains/auth/auth.service";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";

export const AUTH_QUERY_KEY = "AUTH_QUERY_KEY";

export const useQueryAuthMe = (options?: { enabled?: boolean }) => {
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);

  return useQuery({
    queryKey: [AUTH_QUERY_KEY],
    queryFn: authService.me,
    enabled: (options?.enabled ?? true) && isLoggedIn,
  });
};
