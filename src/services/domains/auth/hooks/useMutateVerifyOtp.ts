import { useMutation } from "@tanstack/react-query";
import authService from "@/services/domains/auth/auth.service";

export const useMutateVerifyOtp = () => {
  return useMutation({
    mutationFn: authService.verifyOtp,
  });
};
