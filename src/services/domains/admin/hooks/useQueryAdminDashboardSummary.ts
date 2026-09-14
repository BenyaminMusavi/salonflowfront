import { useQuery } from "@tanstack/react-query";
import adminService from "@/services/domains/admin/admin.service";

export const ADMIN_DASHBOARD_SUMMARY_QUERY_KEY = "ADMIN_DASHBOARD_SUMMARY_QUERY_KEY";

export const useQueryAdminDashboardSummary = () => {
  return useQuery({
    queryKey: [ADMIN_DASHBOARD_SUMMARY_QUERY_KEY],
    queryFn: adminService.dashboardSummary,
  });
};
