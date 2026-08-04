import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import { ICreateTipRequest, TTipEntity, TTipsEntity } from "./types/tips.type";

class TipsService {
  async create(body: ICreateTipRequest) {
    return await axiosInstance.post<unknown, TTipEntity>(API_ADDRESS.TIPS.BASE, body);
  }

  async getByAppointment(appointmentId: number) {
    return await axiosInstance.get<unknown, TTipsEntity>(
      API_ADDRESS.TIPS.BY_APPOINTMENT(appointmentId)
    );
  }
}

const tipsService = new TipsService();
export default tipsService;

