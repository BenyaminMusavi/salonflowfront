import { useMutation, useQueryClient } from "@tanstack/react-query";
import authService from "@/services/domains/auth/auth.service";
import { IUpdateProfileRequest } from "@/services/domains/auth/types/auth.type";
import { AUTH_QUERY_KEY } from "@/services/domains/auth/hooks/useQueryAuthMe";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateProfileRequest) => authService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTH_QUERY_KEY] });
    },
  });
};
