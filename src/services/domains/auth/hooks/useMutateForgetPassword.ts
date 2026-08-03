import { useMutation } from "@tanstack/react-query";
import authService from "@/services/domains/auth/auth.service";
import { IForgetPasswordRequest } from "@/services/domains/auth/types/auth.type";

export const useMutateForgetPassword = () => {
  return useMutation({
    mutationFn: (data: IForgetPasswordRequest) =>
      authService.forgetPassword(data),
  });
};
