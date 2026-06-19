import { useMutation } from "@tanstack/react-query";
import authService from "@/services/domains/auth/auth.service";
import { ISetPasswordWithOtpRequest } from "@/services/domains/auth/types/auth.type";

export const useSetPasswordWithOtp = () => {
  return useMutation({
    mutationFn: (data: ISetPasswordWithOtpRequest) =>
      authService.setPasswordWithOtp(data),
  });
};
