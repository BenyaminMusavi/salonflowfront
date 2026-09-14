import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  IAdminMediaVisibilityRequest,
  IAdminSalonListParams,
  IRejectSalonRequest,
  ISalonReasonRequest,
  TAdminDashboardSummaryEntity,
  TAdminMediaActionEntity,
  TAdminSalonActionEntity,
  TAdminSalonDetailEntity,
  TAdminSalonListEntity,
} from "./types/admin.type";

class AdminService {
  async dashboardSummary() {
    return await axiosInstance.get<unknown, TAdminDashboardSummaryEntity>(
      API_ADDRESS.ADMIN.DASHBOARD_SUMMARY
    );
  }

  async listSalons(params: IAdminSalonListParams) {
    return await axiosInstance.get<unknown, TAdminSalonListEntity>(
      API_ADDRESS.ADMIN.SALONS,
      {
        params: {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
          approvalStatus: params.approvalStatus,
          trustStatus: params.trustStatus,
          search: params.search || undefined,
        },
      }
    );
  }

  async getSalonDetail(publicId: string) {
    return await axiosInstance.get<unknown, TAdminSalonDetailEntity>(
      API_ADDRESS.ADMIN.SALON_BY_ID(publicId)
    );
  }

  async approveSalon(publicId: string) {
    return await axiosInstance.post<unknown, TAdminSalonActionEntity>(
      API_ADDRESS.ADMIN.SALON_APPROVE(publicId)
    );
  }

  async rejectSalon(publicId: string, data: IRejectSalonRequest) {
    return await axiosInstance.post<unknown, TAdminSalonActionEntity>(
      API_ADDRESS.ADMIN.SALON_REJECT(publicId),
      data
    );
  }

  async suspendSalon(publicId: string, data: ISalonReasonRequest) {
    return await axiosInstance.post<unknown, TAdminSalonActionEntity>(
      API_ADDRESS.ADMIN.SALON_SUSPEND(publicId),
      data
    );
  }

  async restoreSalon(publicId: string, data: ISalonReasonRequest) {
    return await axiosInstance.post<unknown, TAdminSalonActionEntity>(
      API_ADDRESS.ADMIN.SALON_RESTORE(publicId),
      data
    );
  }

  async hideMedia(mediaId: number, data: IAdminMediaVisibilityRequest) {
    return await axiosInstance.post<unknown, TAdminMediaActionEntity>(
      API_ADDRESS.ADMIN.MEDIA_HIDE(mediaId),
      data
    );
  }

  async unhideMedia(mediaId: number, data: IAdminMediaVisibilityRequest) {
    return await axiosInstance.post<unknown, TAdminMediaActionEntity>(
      API_ADDRESS.ADMIN.MEDIA_UNHIDE(mediaId),
      data
    );
  }
}

const adminService = new AdminService();
export default adminService;
