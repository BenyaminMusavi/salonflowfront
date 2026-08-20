import { useMutation, useQueryClient } from "@tanstack/react-query";
import favoritesService from "../favorites.service";
import { FAVORITES_QUERY_KEY } from "./useQueryFavorites";
import { TFavoritesEntity } from "../types/favorites.type";
import { useFavoriteIdsStore } from "../store/useFavoriteIdsStore";

export const useMutateAddFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (salonPublicId: string) => favoritesService.add(salonPublicId),
    onMutate: async (salonPublicId) => {
      await queryClient.cancelQueries({ queryKey: [FAVORITES_QUERY_KEY] });
      const previous = queryClient.getQueryData<TFavoritesEntity>([
        FAVORITES_QUERY_KEY,
      ]);
      useFavoriteIdsStore.getState().add(salonPublicId);
      return { previous };
    },
    onError: (_err, salonPublicId, ctx) => {
      useFavoriteIdsStore.getState().remove(salonPublicId);
      if (ctx?.previous) {
        queryClient.setQueryData([FAVORITES_QUERY_KEY], ctx.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [FAVORITES_QUERY_KEY] });
    },
  });
};

export const useMutateRemoveFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (salonPublicId: string) =>
      favoritesService.remove(salonPublicId),
    onMutate: async (salonPublicId) => {
      await queryClient.cancelQueries({ queryKey: [FAVORITES_QUERY_KEY] });
      const previous = queryClient.getQueryData<TFavoritesEntity>([
        FAVORITES_QUERY_KEY,
      ]);
      useFavoriteIdsStore.getState().remove(salonPublicId);
      if (previous?.data) {
        queryClient.setQueryData<TFavoritesEntity>([FAVORITES_QUERY_KEY], {
          ...previous,
          data: previous.data.filter((f) => f.salonPublicId !== salonPublicId),
        });
      }
      return { previous };
    },
    onError: (_err, salonPublicId, ctx) => {
      useFavoriteIdsStore.getState().add(salonPublicId);
      if (ctx?.previous) {
        queryClient.setQueryData([FAVORITES_QUERY_KEY], ctx.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [FAVORITES_QUERY_KEY] });
    },
  });
};
