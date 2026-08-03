import { useMutation, useQueryClient } from "@tanstack/react-query";
import favoritesService from "../favorites.service";
import { FAVORITES_QUERY_KEY } from "./useQueryFavorites";

export const useMutateAddFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (salonId: number) => favoritesService.add(salonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FAVORITES_QUERY_KEY] });
    },
  });
};

export const useMutateRemoveFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (salonId: number) => favoritesService.remove(salonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FAVORITES_QUERY_KEY] });
    },
  });
};
