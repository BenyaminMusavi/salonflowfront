import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  ISpecialScheduleRequest,
  TSpecialScheduleEntity,
  TSpecialSchedulesEntity,
} from "./types/special-schedules.type";

class SpecialSchedulesService {
  async listByStaff(
    staffMemberId: number,
    params?: { from?: string; to?: string }
  ) {
    return await axiosInstance.get<unknown, TSpecialSchedulesEntity>(
      API_ADDRESS.SPECIAL_SCHEDULES.BY_STAFF(staffMemberId),
      { params }
    );
  }

  async create(body: ISpecialScheduleRequest) {
    return await axiosInstance.post<unknown, TSpecialScheduleEntity>(
      API_ADDRESS.SPECIAL_SCHEDULES.BASE,
      body
    );
  }

  async update(id: number, body: ISpecialScheduleRequest) {
    return await axiosInstance.put<unknown, TSpecialScheduleEntity>(
      API_ADDRESS.SPECIAL_SCHEDULES.BY_ID(id),
      body
    );
  }

  async remove(id: number) {
    return await axiosInstance.delete<unknown, void>(
      API_ADDRESS.SPECIAL_SCHEDULES.BY_ID(id)
    );
  }
}

const specialSchedulesService = new SpecialSchedulesService();
export default specialSchedulesService;

