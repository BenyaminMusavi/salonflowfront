import { useQuery } from "@tanstack/react-query";
import adminService from "@/services/domains/admin/admin.service";
import { IAdminUsersParams } from "@/services/domains/admin/types/admin.type";

export const ADMIN_USERS_QUERY_KEY = "ADMIN_USERS_QUERY_KEY";

export const useQueryAdminUsers = (params: IAdminUsersParams) => {
  return useQuery({
    queryKey: [ADMIN_USERS_QUERY_KEY, params],
    queryFn: () => adminService.listUsers(params),
  });
};
