import { useQuery } from "@tanstack/react-query";
import salonReportsService from "../salon-reports.service";

export const ADMIN_PENDING_SALON_REPORTS_QUERY_KEY =
  "ADMIN_PENDING_SALON_REPORTS_QUERY_KEY";

export const useQueryAdminPendingSalonReports = (params: {
  page?: number;
  pageSize?: number;
}) => {
  return useQuery({
    queryKey: [
      ADMIN_PENDING_SALON_REPORTS_QUERY_KEY,
      params.page ?? 1,
      params.pageSize ?? 20,
    ],
    queryFn: () => salonReportsService.listPending(params),
  });
};
