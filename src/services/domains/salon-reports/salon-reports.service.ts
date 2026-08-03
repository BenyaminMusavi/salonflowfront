import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  ICreateSalonReportRequest,
  TSalonReportEntity,
} from "./types/salon-reports.type";

class SalonReportsService {
  async create(body: ICreateSalonReportRequest) {
    return await axiosInstance.post<unknown, TSalonReportEntity>(
      API_ADDRESS.SALON_REPORTS.BASE,
      body
    );
  }
}

const salonReportsService = new SalonReportsService();
export default salonReportsService;
