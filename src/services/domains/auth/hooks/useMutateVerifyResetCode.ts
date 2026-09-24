import { useMutation } from "@tanstack/react-query";
import authService from "@/services/domains/auth/auth.service";
import { IVerifyResetCodeRequest } from "@/services/domains/auth/types/auth.type";

export const useMutateVerifyResetCode = () => {
  return useMutation({
    mutationFn: (data: IVerifyResetCodeRequest) =>
      authService.verifyResetCode(data),
  });
};
