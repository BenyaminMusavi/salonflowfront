import { TResponse } from "@/services/common/data-types/SharedDataTypes";
import { TPagedResult } from "@/services/common/data-types/SharedDataTypes";
import { AppointmentStatus } from "@/services/common/enums/domain-enums";

/** One row from the paged appointment-history endpoints: `me`, `staff/me`, `customer/{id}`, `staff/{id}`. */
export interface IAppointmentHistoryItem {
  /** Appointment.PublicId (Guid) — for GET .../me/{id} detail lookups. */
  id: string;
  /** Appointment's internal numeric id — required by the cancel/check-in/complete/no-show {id:long} lifecycle routes. */
  numericId: number;
  startTime: string;
  endTime: string;
  status: AppointmentStatus | number;
  salonName?: string | null;
  branchName?: string | null;
  customerName?: string | null;
  staffNames?: string | null;
  services?: IMyAppointmentService[] | null;
  totalDurationMinutes: number;
  totalPrice: number;
}

/** Optional filters shared by every appointment-history endpoint. `from`/`to` are inclusive Tehran days (`yyyy-MM-dd`). */
export interface IAppointmentHistoryQuery {
  from?: string;
  to?: string;
  status?: number;
  page?: number;
  pageSize?: number;
}

export interface IMyAppointmentService {
  offeringPublicId: string;
  staffPublicId: string;
  name: string;
  durationMinutes: number;
  price: number;
  staffName?: string | null;
}

export interface IMyAppointmentDetail {
  /** Appointment.PublicId (Guid) */
  id: string;
  /** Appointment's internal numeric id — required by the cancel/check-in/complete/no-show {id:long} lifecycle routes. */
  numericId: number;
  startTime: string;
  endTime: string;
  status: AppointmentStatus | number;
  salonName: string;
  branchName?: string | null;
  branchAddress?: string | null;
  services: IMyAppointmentService[];
  totalPrice: number;
  totalDurationMinutes: number;
  staffNames?: string | null;
}

export interface ICancelAppointmentRequest {
  reason: string;
  /** Salon-side only: SMS the customer about the cancellation (backend default: true). */
  notifyCustomer?: boolean;
}

export interface ISalonAppointmentServiceLine {
  serviceName: string;
  durationMinutes: number;
  price: number;
}

export interface ISalonAppointmentItem {
  /** Appointment's internal numeric id — required by the cancel/check-in/complete/no-show {id:long} lifecycle routes. */
  numericId: number;
  publicId?: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus | number;
  salonName: string;
  branchName?: string | null;
  staffNames?: string | null;
  services?: ISalonAppointmentServiceLine[];
}

export interface ISalonAppointmentsQuery {
  salonId?: number;
  date: string;
  status?: number;
  branchId?: number;
  staffMemberId?: number;
  customerId?: number;
  page?: number;
  pageSize?: number;
}

export interface IAppointmentServiceInput {
  offeringId: number;
  staffId: number;
}

export interface IQuickBookRequest {
  phone: string;
  fullName: string;
  branchId: number;
  startTime: string;
  notes?: string | null;
  services: IAppointmentServiceInput[];
}

export interface ICreateSalonAppointmentRequest {
  /** CustomerDto.customerCode (Guid) — valid only inside the salon that owns the customer. Replaces the deprecated numeric customerId. */
  customerCode: string;
  branchId: number;
  startTime: string;
  notes?: string | null;
  source?: number;
  services: IAppointmentServiceInput[];
}

export interface IQuickBookResult {
  appointmentId: number;
  customerId: number;
  /** Per-salon customer code (Guid) — what POST /api/appointments expects as customerCode. */
  customerCode: string;
  isNewCustomer: boolean;
}

export interface IRescheduleAppointmentRequest {
  newStartTime: string;
  /** SMS the customer the new time (backend default: true). */
  notifyCustomer?: boolean;
}

/** Optional body of POST /appointments/{id}/no-show (backend default: no SMS). */
export interface INoShowAppointmentRequest {
  notifyCustomer?: boolean;
}

/** One staff member's day, from GET /appointments/staff/{staffMemberId}/day-board. */
export interface IStaffDayBoardItem {
  appointmentId: number;
  appointmentPublicId?: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus | number;
  customerName: string;
  serviceName: string;
  appointmentServiceId: number;
}

/** One staff member's group in the batch branch day-board response. */
export interface IBranchDayBoardGroup {
  staffMemberId: number;
  staffMemberPublicId: string;
  staffName: string;
  items: IStaffDayBoardItem[];
}

export type TSalonAppointmentsEntity = TResponse<TPagedResult<ISalonAppointmentItem>>;
export type TAppointmentHistoryEntity = TResponse<TPagedResult<IAppointmentHistoryItem>>;
export type TMyAppointmentDetailEntity = TResponse<IMyAppointmentDetail>;
export type TQuickBookEntity = TResponse<IQuickBookResult>;
export type TCreateSalonAppointmentEntity = TResponse<number>;
export type TStaffDayBoardEntity = TResponse<IStaffDayBoardItem[]>;
export type TBranchDayBoardEntity = TResponse<IBranchDayBoardGroup[]>;

/**
 * One appointment as the panel's appointments page shows it. Today it is stitched together
 * from the day list (`GET /api/appointments`), the branch day-board (customer name) or
 * `staff/me` history; a single agenda endpoint can replace that without touching the UI.
 */
export interface IAgendaItem {
  numericId: number;
  publicId?: string | null;
  startTime: string;
  endTime: string;
  status: AppointmentStatus | number;
  customerName: string | null;
  services: { name: string; staffName?: string | null; durationMinutes: number; price: number }[];
  staffNames: string | null;
  branchName: string | null;
  totalPrice: number;
}

export interface IAgendaQuery {
  /** Inclusive Tehran days, `yyyy-MM-dd`. */
  from: string;
  to: string;
  /** Only appointments served by the caller (`staff/me`). */
  mine?: boolean;
  staffMemberId?: number;
  branchId?: number;
}
