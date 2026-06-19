import { useMutation } from "@tanstack/react-query";
import authService from "@/services/domains/auth/auth.service";

export const useMutateSwitchContext = () => {
  return useMutation({
    mutationFn: ({ salonId, branchId }: { salonId?: number; branchId?: number }) =>
      authService.switchContext(salonId, branchId),
  });
};