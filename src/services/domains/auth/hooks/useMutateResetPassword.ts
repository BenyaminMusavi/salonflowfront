import { useMutation } from "@tanstack/react-query";
import authService from "@/services/domains/auth/auth.service";
import { IResetPasswordRequest } from "@/services/domains/auth/types/auth.type";

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: IResetPasswordRequest) => authService.resetPassword(data),
  });
};
