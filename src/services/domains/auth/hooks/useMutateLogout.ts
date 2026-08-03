import { useMutation } from "@tanstack/react-query";
import authService from "@/services/domains/auth/auth.service";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";

export const useMutateLogout = () => {
  const clearToken = useTokenStore((s) => s.clear);
  const clearSalon = useSalonContextStore((s) => s.clearAll);

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
    },
  });
};
