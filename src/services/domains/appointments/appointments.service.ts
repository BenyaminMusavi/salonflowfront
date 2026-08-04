import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  ICreateSalonAppointmentRequest,
  ICancelAppointmentRequest,
  IQuickBookRequest,
  ISalonAppointmentsQuery,
  TCreateSalonAppointmentEntity,
  TQuickBookEntity,
  TSalonAppointmentsEntity,
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

  async getSalonAppointments(params: ISalonAppointmentsQuery) {
    return await axiosInstance.get<unknown, TSalonAppointmentsEntity>(
      API_ADDRESS.APPOINTMENTS.SALON_LIST,
      {
        params: {
          salonId: params.salonId,
          date: params.date,
          status: params.status,
          branchId: params.branchId,
          staffMemberId: params.staffMemberId,
          customerId: params.customerId,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 50,
        },
      }
    );
  }

  async checkIn(id: number) {
    return await axiosInstance.post<unknown, void>(
      API_ADDRESS.APPOINTMENTS.CHECK_IN(id)
    );
  }

  async complete(id: number) {
    return await axiosInstance.post<unknown, void>(
      API_ADDRESS.APPOINTMENTS.COMPLETE(id)
    );
  }

  async noShow(id: number) {
    return await axiosInstance.post<unknown, void>(
      API_ADDRESS.APPOINTMENTS.NO_SHOW(id)
    );
  }

  async createSalonAppointment(body: ICreateSalonAppointmentRequest) {
    return await axiosInstance.post<unknown, TCreateSalonAppointmentEntity>(
      API_ADDRESS.APPOINTMENTS.CREATE,
      body
    );
  }

  async quickBook(body: IQuickBookRequest) {
    return await axiosInstance.post<unknown, TQuickBookEntity>(
      API_ADDRESS.APPOINTMENTS.QUICK_BOOK,
      body
    );
  }
}

const appointmentsService = new AppointmentsService();
export default appointmentsService;
