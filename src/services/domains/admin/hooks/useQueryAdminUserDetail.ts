import { useQuery } from "@tanstack/react-query";
import adminService from "@/services/domains/admin/admin.service";

export const ADMIN_USER_DETAIL_QUERY_KEY = "ADMIN_USER_DETAIL_QUERY_KEY";

export const useQueryAdminUserDetail = (userPublicId: string | null) => {
  return useQuery({
    queryKey: [ADMIN_USER_DETAIL_QUERY_KEY, userPublicId],
    queryFn: () => adminService.getUserDetail(userPublicId as string),
    enabled: !!userPublicId,
  });
};
