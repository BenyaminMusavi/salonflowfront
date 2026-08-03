import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  ICancelAppointmentRequest,
  TMyAppointmentDetailEntity,
  TMyAppointmentsEntity,
} from "./types/appointments.type";

class AppointmentsService {
  async getMine() {
    return await axiosInstance.get<unknown, TMyAppointmentsEntity>(
      API_ADDRESS.APPOINTMENTS.ME
    );
  }

  async getMineById(id: number) {
    return await axiosInstance.get<unknown, TMyAppointmentDetailEntity>(
      API_ADDRESS.APPOINTMENTS.ME_BY_ID(id)
    );
  }

  /** Success: 204 No Content */
  async cancel(id: number, body: ICancelAppointmentRequest) {
    return await axiosInstance.post<unknown, void>(
      API_ADDRESS.APPOINTMENTS.CANCEL(id),
      body
    );
  }
}

const appointmentsService = new AppointmentsService();
export default appointmentsService;
