import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  ICreateSalonAppointmentRequest,
  ICancelAppointmentRequest,
  IQuickBookRequest,
  IRescheduleAppointmentRequest,
  ISalonAppointmentsQuery,
  TCreateSalonAppointmentEntity,
  TQuickBookEntity,
  TSalonAppointmentsEntity,
  TMyAppointmentDetailEntity,
  TAppointmentHistoryEntity,
  IAppointmentHistoryQuery,
  TStaffDayBoardEntity,
  TBranchDayBoardEntity,
} from "./types/appointments.type";

function historyParams(query: IAppointmentHistoryQuery) {
  return {
    from: query.from || undefined,
    to: query.to || undefined,
    status: query.status,
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 20,
  };
}

class AppointmentsService {
  /** Logged-in user's own bookings as a customer, across all salons (any token). */
  async getMine(query: IAppointmentHistoryQuery = {}) {
    return await axiosInstance.get<unknown, TAppointmentHistoryEntity>(
      API_ADDRESS.APPOINTMENTS.ME,
      { params: historyParams(query) }
    );
  }

  /** Current salon's appointments where the caller is the staff member (salon-context JWT). */
  async getMyStaffAppointments(query: IAppointmentHistoryQuery = {}) {
    return await axiosInstance.get<unknown, TAppointmentHistoryEntity>(
      API_ADDRESS.APPOINTMENTS.STAFF_ME,
      { params: historyParams(query) }
    );
  }

  /** One customer's appointments in the current salon (SalonOwner/Staff, salon-context JWT). */
  async getCustomerAppointments(
    customerPublicId: string,
    query: IAppointmentHistoryQuery = {}
  ) {
    return await axiosInstance.get<unknown, TAppointmentHistoryEntity>(
      API_ADDRESS.APPOINTMENTS.BY_CUSTOMER(customerPublicId),
      { params: historyParams(query) }
    );
  }

  /** One staff member's appointments in the current salon (SalonOwner only, salon-context JWT). */
  async getStaffAppointments(
    staffPublicId: string,
    query: IAppointmentHistoryQuery = {}
  ) {
    return await axiosInstance.get<unknown, TAppointmentHistoryEntity>(
      API_ADDRESS.APPOINTMENTS.BY_STAFF(staffPublicId),
      { params: historyParams(query) }
    );
  }

  async getMineById(appointmentPublicId: string) {
    return await axiosInstance.get<unknown, TMyAppointmentDetailEntity>(
      API_ADDRESS.APPOINTMENTS.ME_BY_ID(appointmentPublicId)
    );
  }

  /** Success: 204 No Content */
  async cancel(id: string | number, body: ICancelAppointmentRequest) {
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

  /** Success: 204 No Content */
  async reschedule(id: number, body: IRescheduleAppointmentRequest) {
    return await axiosInstance.post<unknown, void>(
      API_ADDRESS.APPOINTMENTS.RESCHEDULE(id),
      body
    );
  }

  async getStaffDayBoard(staffMemberId: number, date: string) {
    return await axiosInstance.get<unknown, TStaffDayBoardEntity>(
      API_ADDRESS.APPOINTMENTS.STAFF_DAY_BOARD(staffMemberId),
      { params: { date } }
    );
  }

  /** Every staff member's day-board for one branch in a single request. */
  async getBranchDayBoard(branchPublicId: string, date: string) {
    return await axiosInstance.get<unknown, TBranchDayBoardEntity>(
      API_ADDRESS.APPOINTMENTS.BRANCH_DAY_BOARD(branchPublicId),
      { params: { date } }
    );
  }
}

const appointmentsService = new AppointmentsService();
export default appointmentsService;
