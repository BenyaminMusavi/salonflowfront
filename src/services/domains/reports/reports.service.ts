import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  IAppointmentFunnel,
  IAtRiskCustomerRow,
  ICustomersSummary,
  IFillRate,
  IOutstandingReport,
  IPeakHours,
  IReportRangeParams,
  IRevenueByBranchRow,
  IRevenueByDayRow,
  IRevenueByMethodRow,
  IRevenueByServiceRow,
  IStaffPerformanceRow,
  ITopCustomerRow,
  TDashboardExportReport,
  TDashboardSummaryEntity,
  TReportListEntity,
  TZReportEntity,
} from "./types/reports.type";
import { TResponse } from "@/services/common/data-types/SharedDataTypes";

class ReportsService {
  async getZReport(params: { salonId: number; date: string }) {
    return await axiosInstance.get<unknown, TZReportEntity>(
      API_ADDRESS.REPORTS.Z_REPORT,
      { params }
    );
  }

  async getDashboardSummary(params: IReportRangeParams) {
    return await axiosInstance.get<unknown, TDashboardSummaryEntity>(
      API_ADDRESS.REPORTS.DASHBOARD_SUMMARY,
      { params }
    );
  }

  async getRevenueByMethod(params: IReportRangeParams) {
    return await axiosInstance.get<
      unknown,
      TReportListEntity<IRevenueByMethodRow>
    >(API_ADDRESS.REPORTS.REVENUE_BY_METHOD, { params });
  }

  async getRevenueByService(params: IReportRangeParams) {
    return await axiosInstance.get<
      unknown,
      TReportListEntity<IRevenueByServiceRow>
    >(API_ADDRESS.REPORTS.REVENUE_BY_SERVICE, { params });
  }

  async getRevenueByBranch(params: IReportRangeParams) {
    return await axiosInstance.get<
      unknown,
      TReportListEntity<IRevenueByBranchRow>
    >(API_ADDRESS.REPORTS.REVENUE_BY_BRANCH, { params });
  }

  async getRevenueByDay(params: IReportRangeParams) {
    return await axiosInstance.get<unknown, TReportListEntity<IRevenueByDayRow>>(
      API_ADDRESS.REPORTS.REVENUE_BY_DAY,
      { params }
    );
  }

  async getOutstanding(params: IReportRangeParams) {
    return await axiosInstance.get<unknown, TResponse<IOutstandingReport>>(
      API_ADDRESS.REPORTS.OUTSTANDING,
      { params }
    );
  }

  async getAppointmentFunnel(params: IReportRangeParams) {
    return await axiosInstance.get<unknown, TResponse<IAppointmentFunnel>>(
      API_ADDRESS.REPORTS.APPOINTMENT_FUNNEL,
      { params }
    );
  }

  async getStaffPerformance(params: IReportRangeParams) {
    return await axiosInstance.get<
      unknown,
      TReportListEntity<IStaffPerformanceRow>
    >(API_ADDRESS.REPORTS.STAFF_PERFORMANCE, { params });
  }

  async getPeakHours(params: IReportRangeParams) {
    return await axiosInstance.get<unknown, TResponse<IPeakHours>>(
      API_ADDRESS.REPORTS.PEAK_HOURS,
      { params }
    );
  }

  async getFillRate(params: IReportRangeParams) {
    return await axiosInstance.get<unknown, TResponse<IFillRate>>(
      API_ADDRESS.REPORTS.FILL_RATE,
      { params }
    );
  }

  async getCustomersSummary(params: IReportRangeParams) {
    return await axiosInstance.get<unknown, TResponse<ICustomersSummary>>(
      API_ADDRESS.REPORTS.CUSTOMERS_SUMMARY,
      { params }
    );
  }

  async getCustomersTop(params: IReportRangeParams & { lifetime?: boolean }) {
    return await axiosInstance.get<unknown, TReportListEntity<ITopCustomerRow>>(
      API_ADDRESS.REPORTS.CUSTOMERS_TOP,
      { params }
    );
  }

  async getCustomersAtRisk(
    params: IReportRangeParams & { inactiveDays?: number }
  ) {
    return await axiosInstance.get<
      unknown,
      TReportListEntity<IAtRiskCustomerRow>
    >(API_ADDRESS.REPORTS.CUSTOMERS_AT_RISK, { params });
  }

  async exportCsv(params: IReportRangeParams & { report: TDashboardExportReport }) {
    return await axiosInstance.get<unknown, Blob>(API_ADDRESS.REPORTS.EXPORT, {
      params,
      responseType: "blob",
    });
  }
}

const reportsService = new ReportsService();
export default reportsService;
