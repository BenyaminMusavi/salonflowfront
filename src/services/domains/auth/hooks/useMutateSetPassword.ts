import { useMutation } from "@tanstack/react-query";
import authService from "@/services/domains/auth/auth.service";
import { ISetPasswordRequest } from "@/services/domains/auth/types/auth.type";

export const useSetPassword = () => {
  return useMutation({
    mutationFn: (data: ISetPasswordRequest) => authService.setPassword(data),
  });
};
