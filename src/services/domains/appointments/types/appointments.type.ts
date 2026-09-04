import { TResponse } from "@/services/common/data-types/SharedDataTypes";
import { TPagedResult } from "@/services/common/data-types/SharedDataTypes";
import { AppointmentStatus } from "@/services/common/enums/domain-enums";

export interface IMyAppointmentListItem {
  /** Appointment.PublicId (Guid) — for GET .../me/{id} detail lookups. */
  id: string;
  /** Appointment's internal numeric id — required by the cancel/check-in/complete/no-show {id:long} lifecycle routes. */
  numericId: number;
  startTime: string;
  endTime: string;
  status: AppointmentStatus | number;
  salonName: string;
  staffNames?: string | null;
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
  customerId: number;
  branchId: number;
  startTime: string;
  notes?: string | null;
  source?: number;
  services: IAppointmentServiceInput[];
}

export interface IQuickBookResult {
  appointmentId: number;
  customerId: number;
  isNewCustomer: boolean;
}

export interface IRescheduleAppointmentRequest {
  newStartTime: string;
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
export type TMyAppointmentsEntity = TResponse<IMyAppointmentListItem[]>;
export type TMyAppointmentDetailEntity = TResponse<IMyAppointmentDetail>;
export type TQuickBookEntity = TResponse<IQuickBookResult>;
export type TCreateSalonAppointmentEntity = TResponse<number>;
export type TStaffDayBoardEntity = TResponse<IStaffDayBoardItem[]>;
export type TBranchDayBoardEntity = TResponse<IBranchDayBoardGroup[]>;
