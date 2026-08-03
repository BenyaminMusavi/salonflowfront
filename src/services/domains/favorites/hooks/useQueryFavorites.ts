import { useQuery } from "@tanstack/react-query";
import favoritesService from "../favorites.service";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";

export const FAVORITES_QUERY_KEY = "FAVORITES_QUERY_KEY";

export const useQueryFavorites = () => {
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);

  return useQuery({
    queryKey: [FAVORITES_QUERY_KEY],
    queryFn: () => favoritesService.list(),
    enabled: isLoggedIn,
  });
};
