import { useMutation } from "@tanstack/react-query";
import authService from "@/services/domains/auth/auth.service";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useMyReviewsStore } from "@/services/domains/reviews/store/useMyReviewsStore";

export const useMutateLogout = () => {
  const clearToken = useTokenStore((s) => s.clear);
  const clearSalon = useSalonContextStore((s) => s.clearAll);
  const clearReviews = useMyReviewsStore((s) => s.clear);

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
    },
  });
};
