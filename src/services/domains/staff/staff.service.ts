import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import type {
  IInviteStaffRequest,
  IScheduleExceptionRequest,
  IUpdateStaffRequest,
  IWeeklyDay,
  TMyStaffEntity,
  TRemovalImpactEntity,
  TScheduleExceptionEntity,
  TStaffItemEntity,
  TStaffListEntity,
  TTeamScheduleEntity,
  TWeeklyScheduleEntity,
} from "./types/staff.type";

class StaffService {
  async list() {
    return await axiosInstance.get<unknown, TStaffListEntity>(API_ADDRESS.STAFF.BASE);
  }

  async me() {
    return await axiosInstance.get<unknown, TMyStaffEntity>(API_ADDRESS.STAFF.ME);
  }

  async invite(body: IInviteStaffRequest) {
    return await axiosInstance.post<unknown, TStaffItemEntity>(API_ADDRESS.STAFF.INVITATIONS, body);
  }

  async update(publicId: string, body: IUpdateStaffRequest) {
    return await axiosInstance.patch<unknown, TStaffItemEntity>(API_ADDRESS.STAFF.BY_ID(publicId), body);
  }

  async remove(publicId: string) {
    return await axiosInstance.delete(API_ADDRESS.STAFF.BY_ID(publicId));
  }

  async removalImpact(publicId: string) {
    return await axiosInstance.get<unknown, TRemovalImpactEntity>(API_ADDRESS.STAFF.REMOVAL_IMPACT(publicId));
  }

  async resendInvitation(publicId: string) {
    return await axiosInstance.post(API_ADDRESS.STAFF.RESEND_INVITATION(publicId));
  }

  async saveWeekly(publicId: string, days: IWeeklyDay[]) {
    return await axiosInstance.put<unknown, TWeeklyScheduleEntity>(API_ADDRESS.STAFF.WEEKLY(publicId), { days });
  }

  async addException(publicId: string, body: IScheduleExceptionRequest) {
    return await axiosInstance.post<unknown, TScheduleExceptionEntity>(API_ADDRESS.STAFF.EXCEPTIONS(publicId), body);
  }

  async team(from: string, to: string) {
    return await axiosInstance.get<unknown, TTeamScheduleEntity>(API_ADDRESS.STAFF.TEAM_SCHEDULE, {
      params: { from, to },
    });
  }
}

const staffService = new StaffService();
export default staffService;
