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

/** One appointment as every panel list shows it (agenda, customer and staff history). */
export interface IAgendaItem {
  numericId: number;
  publicId?: string | null;
  startTime: string;
  endTime: string;
  status: AppointmentStatus | number;
  customerName: string | null;
  customerPublicId?: string | null;
  customerPhone?: string | null;
  isNewCustomer?: boolean;
  services: { name: string; staffName?: string | null; staffPublicId?: string | null; durationMinutes: number; price: number }[];
  staffNames: string | null;
  branchName: string | null;
  totalPrice: number;
  paymentStatus?: TPaymentStatus | string | null;
  outstanding?: number;
  hasNote?: boolean;
}

export interface IAgendaQuery {
  /** Inclusive Tehran days, `yyyy-MM-dd`. */
  from: string;
  to: string;
  /** Only appointments served by the caller (`staff/me`). */
  mine?: boolean;
  staffMemberId?: number;
  /** Guid filters of the agenda endpoint. */
  staffPublicId?: string;
  branchId?: number;
  branchPublicId?: string;
}

/* ---------- Salon panel endpoints (agenda, details, availability, checkout) ---------- */

export type TPaymentStatus = "none" | "partial" | "paid";

/** Server `AppointmentActions` — what the caller may do to this appointment right now. */
export type TAppointmentAction =
  | "checkIn"
  | "complete"
  | "noShow"
  | "cancel"
  | "reschedule"
  | "collectPayment"
  | "refund";

export interface IAppointmentServiceLine {
  offeringPublicId: string;
  name: string | null;
  staffPublicId: string;
  staffName: string | null;
  durationMinutes: number;
  price: number;
}

export interface IAgendaItemDto {
  publicId: string;
  numericId: number;
  startTime: string;
  endTime: string;
  status: AppointmentStatus | number;
  paymentStatus: TPaymentStatus | string | null;
  customer: { publicId: string; customerCode?: string | null; fullName: string | null; phone: string | null; isNew: boolean } | null;
  services: IAppointmentServiceLine[];
  branch: { publicId: string; name: string | null } | null;
  source?: number;
  hasNote: boolean;
  totalPrice: number;
  outstanding: number;
}

export interface IAgendaDayDto {
  date: string;
  counts: { total: number; scheduled: number; checkedIn: number; completed: number; cancelled: number; noShow: number; unpaid: number };
  items: IAgendaItemDto[];
}

export interface IAgendaParams {
  from: string;
  to: string;
  staffPublicId?: string;
  mine?: boolean;
  branchPublicId?: string;
}

export interface ISalonAppointmentDetails {
  publicId: string;
  numericId: number;
  startTime: string;
  endTime: string;
  status: AppointmentStatus | number;
  source?: number;
  customer: {
    publicId: string;
    customerCode?: string | null;
    fullName: string | null;
    phone: string | null;
    visitsCount: number;
    noShowCount: number;
    lastVisitAt?: string | null;
    note?: string | null;
  } | null;
  services: IAppointmentServiceLine[];
  branch: { publicId: string; name: string | null; address?: string | null } | null;
  customerNote?: string | null;
  internalNote?: string | null;
  money: {
    total: number;
    discount: number;
    deposit: number;
    paid: number;
    outstanding: number;
    paymentStatus: TPaymentStatus | string | null;
    invoiceId?: number | null;
    invoicePublicId?: string | null;
    invoiceTotal?: number | null;
  };
  statusHistory: { status: number; at: string; byName?: string | null; reason?: string | null }[];
  allowedActions: (TAppointmentAction | string)[];
}

export interface ISalonAvailabilityParams {
  from: string;
  to: string;
  offeringPublicIds: string[];
  staffPublicId?: string;
  branchPublicId?: string;
  excludeAppointmentPublicId?: string;
  includeOutsideHours?: boolean;
}

export interface ISalonAvailabilitySlot {
  startTime: string;
  outsideHours: boolean;
  kind?: number;
  staff: { publicId: string; name: string | null; endTime: string }[];
}

export interface ISalonAvailabilityDay {
  date: string;
  slots: ISalonAvailabilitySlot[];
}

export interface ICheckoutRequest {
  completeFirst: boolean;
  payments: { method: number; amount: number }[];
  tip?: { staffPublicId: string; amount: number } | null;
  discount?: number | null;
  idempotencyKey: string;
}

export interface ICheckoutResult {
  appointment: ISalonAppointmentDetails;
  invoice: { id: number; publicId: string; total: number; outstanding: number } | null;
  paymentStatus: TPaymentStatus | string | null;
}

export interface IGuidRescheduleRequest {
  newStartTime: string;
  newStaffPublicId?: string | null;
  notifyCustomer: boolean;
  allowOutsideWorkingHours?: boolean;
}

export type TAgendaEntity = TResponse<{ days: IAgendaDayDto[] }>;
export type TSalonAppointmentDetailsEntity = TResponse<ISalonAppointmentDetails>;
export type TSalonAvailabilityEntity = TResponse<{ days: ISalonAvailabilityDay[] }>;
export type TCheckoutEntity = TResponse<ICheckoutResult>;
