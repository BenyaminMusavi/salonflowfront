import { useMutation } from "@tanstack/react-query";
import adminService from "@/services/domains/admin/admin.service";
import {
  IAdminPlatformReportDateParams,
  TAdminPlatformReportName,
} from "@/services/domains/admin/types/admin.type";

export const useMutateExportPlatformReport = () => {
  return useMutation({
    mutationFn: (
      params: IAdminPlatformReportDateParams & { report: TAdminPlatformReportName }
    ) => adminService.exportPlatformReport(params),
  });
};
