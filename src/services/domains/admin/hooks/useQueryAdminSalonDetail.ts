import { useQuery } from "@tanstack/react-query";
import adminService from "@/services/domains/admin/admin.service";

export const ADMIN_SALON_DETAIL_QUERY_KEY = "ADMIN_SALON_DETAIL_QUERY_KEY";

export const useQueryAdminSalonDetail = (publicId: string | null) => {
  return useQuery({
    queryKey: [ADMIN_SALON_DETAIL_QUERY_KEY, publicId],
    queryFn: () => adminService.getSalonDetail(publicId as string),
    enabled: !!publicId,
  });
};
