import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  IWorkingScheduleRequest,
  TWorkingScheduleEntity,
  TWorkingSchedulesEntity,
} from "./types/working-schedules.type";

class WorkingSchedulesService {
  async listByStaff(staffMemberId: number) {
    return await axiosInstance.get<unknown, TWorkingSchedulesEntity>(
      API_ADDRESS.WORKING_SCHEDULES.BY_STAFF(staffMemberId)
    );
  }

  async create(body: IWorkingScheduleRequest) {
    return await axiosInstance.post<unknown, TWorkingScheduleEntity>(
      API_ADDRESS.WORKING_SCHEDULES.BASE,
      body
    );
  }

  async update(id: number, body: IWorkingScheduleRequest) {
    return await axiosInstance.put<unknown, TWorkingScheduleEntity>(
      API_ADDRESS.WORKING_SCHEDULES.BY_ID(id),
      body
    );
  }

  async remove(id: number) {
    return await axiosInstance.delete<unknown, void>(
      API_ADDRESS.WORKING_SCHEDULES.BY_ID(id)
    );
  }
}

const workingSchedulesService = new WorkingSchedulesService();
export default workingSchedulesService;

