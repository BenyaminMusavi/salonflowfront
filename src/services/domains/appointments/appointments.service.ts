import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  ICreateSalonAppointmentRequest,
  ICancelAppointmentRequest,
  INoShowAppointmentRequest,
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
  IAgendaParams,
  ISalonAvailabilityParams,
  ICheckoutRequest,
  IGuidRescheduleRequest,
  TAgendaEntity,
  TSalonAppointmentDetailsEntity,
  TSalonAvailabilityEntity,
  TCheckoutEntity,
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

  /** Current salon's appointments where the caller is the staff member (panel `X-Salon-Id`). */
  async getMyStaffAppointments(query: IAppointmentHistoryQuery = {}) {
    return await axiosInstance.get<unknown, TAppointmentHistoryEntity>(
      API_ADDRESS.APPOINTMENTS.STAFF_ME,
      { params: historyParams(query) }
    );
  }

  /** One customer's appointments in the current salon (SalonOwner/Staff, panel `X-Salon-Id`). */
  async getCustomerAppointments(
    customerPublicId: string,
    query: IAppointmentHistoryQuery = {}
  ) {
    return await axiosInstance.get<unknown, TAppointmentHistoryEntity>(
      API_ADDRESS.APPOINTMENTS.BY_CUSTOMER(customerPublicId),
      { params: historyParams(query) }
    );
  }

  /** One staff member's appointments in the current salon (SalonOwner only, panel `X-Salon-Id`). */
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

  async noShow(id: number, body: INoShowAppointmentRequest = {}) {
    return await axiosInstance.post<unknown, void>(
      API_ADDRESS.APPOINTMENTS.NO_SHOW(id),
      body
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
  /* ---------- Salon panel (Guid routes) ---------- */

  async getAgenda(params: IAgendaParams) {
    return await axiosInstance.get<unknown, TAgendaEntity>(API_ADDRESS.APPOINTMENTS.AGENDA, {
      params: {
        from: params.from,
        to: params.to,
        staffPublicId: params.staffPublicId,
        mine: params.mine || undefined,
        branchPublicId: params.branchPublicId,
      },
    });
  }

  async getSalonDetails(publicId: string) {
    return await axiosInstance.get<unknown, TSalonAppointmentDetailsEntity>(
      API_ADDRESS.APPOINTMENTS.SALON_DETAILS(publicId)
    );
  }

  async getSalonAvailability(params: ISalonAvailabilityParams) {
    return await axiosInstance.get<unknown, TSalonAvailabilityEntity>(
      API_ADDRESS.APPOINTMENTS.SALON_AVAILABILITY,
      {
        params: {
          from: params.from,
          to: params.to,
          offeringPublicIds: params.offeringPublicIds,
          staffPublicId: params.staffPublicId,
          branchPublicId: params.branchPublicId,
          excludeAppointmentPublicId: params.excludeAppointmentPublicId,
          includeOutsideHours: params.includeOutsideHours || undefined,
        },
        paramsSerializer: { indexes: null },
      }
    );
  }

  async checkInByPublicId(publicId: string) {
    return await axiosInstance.post(API_ADDRESS.APPOINTMENTS.ACTION(publicId, "check-in"));
  }

  async completeByPublicId(publicId: string) {
    return await axiosInstance.post(API_ADDRESS.APPOINTMENTS.ACTION(publicId, "complete"));
  }

  async noShowByPublicId(publicId: string, notifyCustomer: boolean) {
    return await axiosInstance.post(API_ADDRESS.APPOINTMENTS.ACTION(publicId, "no-show"), { notifyCustomer });
  }

  async cancelByPublicId(publicId: string, body: { reason: string; notifyCustomer: boolean }) {
    return await axiosInstance.post(API_ADDRESS.APPOINTMENTS.ACTION(publicId, "cancel"), body);
  }

  async rescheduleByPublicId(publicId: string, body: IGuidRescheduleRequest) {
    return await axiosInstance.post(API_ADDRESS.APPOINTMENTS.ACTION(publicId, "reschedule"), body);
  }

  /** Reverts a check-in / complete within 5 minutes; returns fresh details. */
  async undoStatus(publicId: string) {
    return await axiosInstance.post<unknown, TSalonAppointmentDetailsEntity>(
      API_ADDRESS.APPOINTMENTS.ACTION(publicId, "undo-status")
    );
  }

  /** Complete (optional) + final invoice + payments + tip in one idempotent request. */
  async checkout(publicId: string, body: ICheckoutRequest) {
    return await axiosInstance.post<unknown, TCheckoutEntity>(
      API_ADDRESS.APPOINTMENTS.ACTION(publicId, "checkout"),
      body
    );
  }

  async setInternalNote(publicId: string, note: string | null) {
    return await axiosInstance.patch(API_ADDRESS.APPOINTMENTS.INTERNAL_NOTE(publicId), { note });
  }
}

const appointmentsService = new AppointmentsService();
export default appointmentsService;
