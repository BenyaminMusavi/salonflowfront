import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryFavorites } from "./useQueryFavorites";
import {
  useMutateAddFavorite,
  useMutateRemoveFavorite,
} from "./useMutateFavorite";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { RouteAddress } from "@/shared/data/routeAddress";

/**
 * Toggle favorite for a numeric salon id (long).
 * Returns no-op when salonId is missing (Guid-only catalog cards).
 */
export const useToggleFavorite = (salonId: number | undefined) => {
  const router = useRouter();
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const { data } = useQueryFavorites();
  const add = useMutateAddFavorite();
  const remove = useMutateRemoveFavorite();

  const isFavorite = useMemo(() => {
    if (!salonId || !data?.data) return false;
    return data.data.some((f) => f.salonId === salonId);
  }, [data?.data, salonId]);

  const isPending = add.isPending || remove.isPending;

  const toggle = async () => {
    if (!salonId) return;
    if (!isLoggedIn) {
      router.push(RouteAddress.AUTH.LOGIN.BASE);
      return;
    }
    if (isFavorite) {
      await remove.mutateAsync(salonId);
    } else {
      await add.mutateAsync(salonId);
    }
  };

  return {
    isFavorite,
    isPending,
    canToggle: typeof salonId === "number",
    toggle,
  };
};
