import { useQuery } from "@tanstack/react-query";
import favoritesService from "../favorites.service";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useFavoriteIdsStore } from "../store/useFavoriteIdsStore";

export const FAVORITES_QUERY_KEY = "FAVORITES_QUERY_KEY";

export const useQueryFavorites = () => {
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const salonId = useSalonContextStore((s) => s.salonId);

  return useQuery({
    queryKey: [FAVORITES_QUERY_KEY],
    queryFn: async () => {
      const res = await favoritesService.list();
      const ids = (res.data ?? []).map((item) => item.salonPublicId);
      useFavoriteIdsStore.getState().setIds(ids);
      return res;
    },
    enabled: isLoggedIn && salonId == null,
  });
};
