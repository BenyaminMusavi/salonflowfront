import { TResponse, TPagedResult } from "@/services/common/data-types/SharedDataTypes";
import { PersonGender } from "@/services/common/enums/domain-enums";
import type { IAgendaItemDto } from "@/services/domains/appointments/types/appointments.type";

export interface ICustomer {
  id: number;
  /** Customer.PublicId (Guid) — for GET /api/appointments/customer/{customerPublicId}. */
  publicId: string;
  /** Per-salon customer code (Guid) — send as customerCode on POST /api/appointments; valid only in this salon. */
  customerCode: string;
  fullName: string;
  phone: string;
  email?: string;
  birthDate?: string;
  gender?: PersonGender;
  smsConsent?: boolean;
  ownerStaffId?: number;
  /** List rows only: completed visits in this salon, last visit and the next booked appointment. */
  visitsCount?: number;
  lastVisitAt?: string | null;
  nextAppointmentAt?: string | null;
  noShowCount?: number;
}

export type TCustomerSegment = "all" | "new" | "inactive";
export type TCustomerSort = "lastVisit" | "name" | "visits";

export interface ICustomerListParams {
  search?: string;
  page?: number;
  pageSize?: number;
  segment?: TCustomerSegment;
  sort?: TCustomerSort;
}

/** GET /api/customers/{publicId} — this salon's file on one customer. */
export interface ICustomerDetails {
  id: number;
  publicId: string;
  customerCode: string;
  fullName: string | null;
  phone: string | null;
  /** The salon's own note about this customer (the customer never sees it). */
  note: string | null;
  createdAt?: string | null;
  stats: { visits: number; completed: number; cancelled: number; noShow: number; totalSpent?: number | null };
  upcoming: IAgendaItemDto[];
}

export interface IPatchCustomerRequest {
  fullName?: string | null;
  note?: string | null;
}

export type TCustomersEntity = TResponse<TPagedResult<ICustomer>>;
export type TCustomerDetailsEntity = TResponse<ICustomerDetails>;
