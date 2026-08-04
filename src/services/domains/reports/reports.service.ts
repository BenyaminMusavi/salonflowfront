import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import { TZReportEntity } from "./types/reports.type";

class ReportsService {
  async getZReport(params: { salonId: number; date: string }) {
    return await axiosInstance.get<unknown, TZReportEntity>(API_ADDRESS.REPORTS.Z_REPORT, {
      params,
    });
  }
}

const reportsService = new ReportsService();
export default reportsService;

