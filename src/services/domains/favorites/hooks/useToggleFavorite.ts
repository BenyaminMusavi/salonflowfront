import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryFavorites } from "./useQueryFavorites";
import {
  useMutateAddFavorite,
  useMutateRemoveFavorite,
} from "./useMutateFavorite";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useMutateSwitchContext } from "@/services/domains/auth/hooks/useMutateSwitchContext";
import { getLoginHref } from "@/shared/utils/authRedirect";
import { useFavoriteIdsStore } from "../store/useFavoriteIdsStore";

/**
 * Toggle favorite by catalog Guid (`salonPublicId` === `SalonCardDto.id`).
 */
export const useToggleFavorite = (salonPublicId: string | undefined) => {
  const router = useRouter();
  const pathname = usePathname();
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const activeSalonId = useSalonContextStore((s) => s.salonId);
  const switchContext = useMutateSwitchContext();
  useQueryFavorites();
  const ids = useFavoriteIdsStore((s) => s.ids);
  const add = useMutateAddFavorite();
  const remove = useMutateRemoveFavorite();

  const isFavorite = useMemo(() => {
    if (!salonPublicId) return false;
    return ids.includes(salonPublicId);
  }, [ids, salonPublicId]);

  const isPending =
    add.isPending || remove.isPending || switchContext.isPending;

  const toggle = async () => {
    if (!salonPublicId) return;
    if (!isLoggedIn) {
      router.push(getLoginHref(pathname));
      return;
    }
    if (activeSalonId != null) {
      await switchContext.mutateAsync({ salonId: null, branchId: null });
    }
    if (isFavorite) {
      await remove.mutateAsync(salonPublicId);
    } else {
      await add.mutateAsync(salonPublicId);
    }
  };

  return {
    isFavorite,
    isPending,
    canToggle: Boolean(salonPublicId),
    toggle,
  };
};
