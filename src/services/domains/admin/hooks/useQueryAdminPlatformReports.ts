import { useQuery } from "@tanstack/react-query";
import adminService from "@/services/domains/admin/admin.service";
import { IAdminPlatformReportDateParams } from "@/services/domains/admin/types/admin.type";

export const ADMIN_PROMO_PERFORMANCE_QUERY_KEY = "ADMIN_PROMO_PERFORMANCE_QUERY_KEY";
export const ADMIN_REFERRAL_PERFORMANCE_QUERY_KEY =
  "ADMIN_REFERRAL_PERFORMANCE_QUERY_KEY";

export const useQueryAdminPromoPerformance = (
  params: IAdminPlatformReportDateParams
) => {
  return useQuery({
    queryKey: [ADMIN_PROMO_PERFORMANCE_QUERY_KEY, params],
    queryFn: () => adminService.getPromoPerformance(params),
  });
};

export const useQueryAdminReferralPerformance = (
  params: IAdminPlatformReportDateParams
) => {
  return useQuery({
    queryKey: [ADMIN_REFERRAL_PERFORMANCE_QUERY_KEY, params],
    queryFn: () => adminService.getReferralPerformance(params),
  });
};
