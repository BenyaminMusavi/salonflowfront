import { useQuery } from "@tanstack/react-query";
import adminService from "@/services/domains/admin/admin.service";
import { IAdminSalonListParams } from "@/services/domains/admin/types/admin.type";

export const ADMIN_SALONS_QUERY_KEY = "ADMIN_SALONS_QUERY_KEY";

export const useQueryAdminSalons = (params: IAdminSalonListParams) => {
  return useQuery({
    queryKey: [ADMIN_SALONS_QUERY_KEY, params],
    queryFn: () => adminService.listSalons(params),
  });
};
