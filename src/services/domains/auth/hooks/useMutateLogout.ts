import { useMutation, useQueryClient } from "@tanstack/react-query";
import authService from "@/services/domains/auth/auth.service";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useMyReviewsStore } from "@/services/domains/reviews/store/useMyReviewsStore";
import { useFavoriteIdsStore } from "@/services/domains/favorites/store/useFavoriteIdsStore";
import { useOnboardingDraftStore } from "@/services/domains/salons/store/useOnboardingDraftStore";

export const useMutateLogout = () => {
  const queryClient = useQueryClient();
  const clearToken = useTokenStore((s) => s.clear);
  const clearSalon = useSalonContextStore((s) => s.clearAll);
  const clearReviews = useMyReviewsStore((s) => s.clear);
  const clearFavorites = useFavoriteIdsStore((s) => s.clear);
  const resetOnboardingDraft = useOnboardingDraftStore((s) => s.reset);

  return useMutation({
    mutationFn: async () => {
      const refreshToken = useTokenStore.getState().token?.refreshToken;
      if (refreshToken) {
        await authService.logout({ refreshToken });
      }
    },
    onSettled: () => {
      clearToken();
      clearSalon();
      clearReviews();
      clearFavorites();
      // Onboarding draft (name/branches/services/…) is per-account, not per-browser — without
      // this, logging in as a different phone number on the same browser could still see and
      // resume/submit the PREVIOUS account's half-filled salon.
      resetOnboardingDraft();
      // Drop every cached query (auth/me included) so the next login never
      // renders stale data left over from the previous account.
      queryClient.clear();
    },
  });
};
