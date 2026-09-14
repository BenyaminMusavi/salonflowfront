import { useMutation, useQueryClient } from "@tanstack/react-query";
import adminService from "@/services/domains/admin/admin.service";
import { IBlockUserRequest } from "@/services/domains/admin/types/admin.type";
import { ADMIN_USERS_QUERY_KEY } from "./useQueryAdminUsers";
import { ADMIN_USER_DETAIL_QUERY_KEY } from "./useQueryAdminUserDetail";

function useInvalidateUsers() {
  const queryClient = useQueryClient();
  return (userPublicId: string) => {
    queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_QUERY_KEY] });
    queryClient.invalidateQueries({
      queryKey: [ADMIN_USER_DETAIL_QUERY_KEY, userPublicId],
    });
  };
}

export const useMutateBlockUser = () => {
  const invalidate = useInvalidateUsers();

  return useMutation({
    mutationFn: ({
      userPublicId,
      data,
    }: {
      userPublicId: string;
      data: IBlockUserRequest;
    }) => adminService.blockUser(userPublicId, data),
    onSuccess: (_data, { userPublicId }) => invalidate(userPublicId),
  });
};

export const useMutateUnblockUser = () => {
  const invalidate = useInvalidateUsers();

  return useMutation({
    mutationFn: (userPublicId: string) => adminService.unblockUser(userPublicId),
    onSuccess: (_data, userPublicId) => invalidate(userPublicId),
  });
};
