import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  IAdminSalonReportNotesRequest,
  IAdminSalonReportsParams,
  ICreateSalonReportRequest,
  TAdminSalonReportsEntity,
  TSalonReportEntity,
} from "./types/salon-reports.type";

class SalonReportsService {
  async create(body: ICreateSalonReportRequest) {
    return await axiosInstance.post<unknown, TSalonReportEntity>(
      API_ADDRESS.SALON_REPORTS.BASE,
      body
    );
  }

  async listPending(params: IAdminSalonReportsParams) {
    return await axiosInstance.get<unknown, TAdminSalonReportsEntity>(
      API_ADDRESS.SALON_REPORTS.PENDING,
      {
        params: {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
        },
      }
    );
  }

  async investigate(id: number) {
    return await axiosInstance.post<unknown, void>(
      API_ADDRESS.SALON_REPORTS.INVESTIGATE(id)
    );
  }

  async resolve(id: number, data: IAdminSalonReportNotesRequest) {
    return await axiosInstance.post<unknown, void>(
      API_ADDRESS.SALON_REPORTS.RESOLVE(id),
      data
    );
  }

  async dismiss(id: number, data: IAdminSalonReportNotesRequest) {
    return await axiosInstance.post<unknown, void>(
      API_ADDRESS.SALON_REPORTS.DISMISS(id),
      data
    );
  }
}

const salonReportsService = new SalonReportsService();
export default salonReportsService;
