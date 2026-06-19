import { useMutation } from "@tanstack/react-query";
import authService from "@/services/domains/auth/auth.service";
import { ILoginRequest } from "@/services/domains/auth/types/auth.type";

export const useLoginWithPassword = () => {
  return useMutation({
    mutationFn: (data: ILoginRequest) => authService.loginWithPassword(data),
  });
};