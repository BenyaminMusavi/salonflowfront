import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import { TAdminDashboardSummaryEntity } from "./types/admin.type";

class AdminService {
  async dashboardSummary() {
    return await axiosInstance.get<unknown, TAdminDashboardSummaryEntity>(
      API_ADDRESS.ADMIN.DASHBOARD_SUMMARY
    );
  }
}

const adminService = new AdminService();
export default adminService;
