import { useQuery } from "@tanstack/react-query";
import authService from "@/services/domains/auth/auth.service";

export const AUTH_QUERY_KEY = "AUTH_QUERY_KEY";

export const useQueryAuthMe = () => {
  return useQuery({
    queryKey: [AUTH_QUERY_KEY],
    queryFn: authService.me,
  });
};