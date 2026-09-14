import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  IAdminMediaVisibilityRequest,
  IAdminSalonListParams,
  IAdminUsersParams,
  IBlockUserRequest,
  IRejectSalonRequest,
  ISalonReasonRequest,
  TAdminDashboardSummaryEntity,
  TAdminMediaActionEntity,
  TAdminSalonActionEntity,
  TAdminSalonDetailEntity,
  TAdminSalonListEntity,
  TAdminUserDetailEntity,
  TAdminUsersEntity,
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

  async listUsers(params: IAdminUsersParams) {
    return await axiosInstance.get<unknown, TAdminUsersEntity>(API_ADDRESS.ADMIN.USERS, {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        role: params.role,
        search: params.search || undefined,
      },
    });
  }

  async getUserDetail(userPublicId: string) {
    return await axiosInstance.get<unknown, TAdminUserDetailEntity>(
      API_ADDRESS.ADMIN.USER_BY_ID(userPublicId)
    );
  }

  async blockUser(userPublicId: string, data: IBlockUserRequest) {
    return await axiosInstance.post<unknown, void>(
      API_ADDRESS.ADMIN.USER_BLOCK(userPublicId),
      data
    );
  }

  async unblockUser(userPublicId: string) {
    return await axiosInstance.post<unknown, void>(
      API_ADDRESS.ADMIN.USER_UNBLOCK(userPublicId)
    );
  }
}

const adminService = new AdminService();
export default adminService;
