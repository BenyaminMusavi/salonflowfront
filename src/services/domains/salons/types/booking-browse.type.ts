import { TResponse } from "@/services/common/data-types/SharedDataTypes";

/** Salon branch from public detail — identify by publicId (Guid). */
export interface ISalonBranch {
  publicId: string;
  /** Required for numeric-only endpoints (GET /api/appointments?branchId=, quick-book) — use publicId where a Guid is expected (e.g. branch day-board). */
  branchId: number;
  name: string;
  city?: string | null;
  address?: string | null;
  phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  genderType?: number | string | null;
  /** Owner/staff view only — the public salon-detail endpoint only ever returns active branches
   * to anonymous/customer callers, so this is always true (or absent) there. */
  isActive?: boolean;
}

/** Branch catalog line — Guid-first for customer booking. */
export interface IBranchService {
  offeringPublicId: string;
  servicePublicId: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  durationMinutes: number;
  price: number;
  requiresDeposit: boolean;
  depositAmount?: number | null;
}

export interface IAvailableDate {
  date: string;
  isAvailable: boolean;
}

export interface IStaffAvailability {
  staffPublicId: string;
  fullName: string;
  profileImageUrl?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  /** @deprecated Prefer staffPublicId */
  staffId?: number | null;
  staffMemberId?: number | null;
}

export interface IPriceLine {
  serviceTypePublicId: string;
  serviceName: string;
  price: number;
  requiresDeposit: boolean;
  depositAmount?: number | null;
  /** @deprecated Prefer serviceTypePublicId */
  serviceTypeId?: number | null;
}

export interface ICalculatePriceResult {
  services: IPriceLine[];
  totalPrice: number;
  totalDepositAmount: number;
  amountDueNow: number;
  remainingAfterDeposit: number;
  freeCancellationWindowHours: number;
}

export interface ISalonBrowseSlot {
  time: string;
  endTime: string;
  /** Assigned staff Guid (booking/slots or browse) */
  staffPublicId?: string | null;
  /** Browse alias for assigned staff Guid */
  staffProfilePublicId?: string | null;
}

export interface ISalonAvailableSlots {
  /** Assigned staff when request used first-available (null staff) */
  staffPublicId?: string | null;
  staffProfilePublicId?: string | null;
  slots: ISalonBrowseSlot[];
}

export interface IGetSalonAvailableSlotsParams {
  salonPublicId: string;
  branchPublicId: string;
  date: string;
  /** ServiceOffering Guids (not service-type Guids) — required by GET /api/booking/slots. */
  offeringPublicIds: string[];
  staffProfilePublicId?: string | null;
}

/** Raw GET /api/booking/first-available payload (start/end are UTC instants, like /booking/slots). */
export interface IFirstAvailableSlotDto {
  /** Salon-local calendar day of `start`, yyyy-MM-dd. */
  date: string;
  start: string;
  end: string;
  staffPublicId: string;
  staffName?: string | null;
}

/** «اولین نوبت» mapped for the wizard: local "HH:mm:ss" times, like ISalonBrowseSlot. */
export interface IFirstAvailableSlot {
  date: string;
  time: string;
  endTime: string;
  staffPublicId: string;
  staffName: string | null;
}

export type TBranchServicesEntity = TResponse<IBranchService[]>;
export type TAvailableDatesEntity = TResponse<IAvailableDate[]>;
export type TStaffAvailabilityEntity = TResponse<IStaffAvailability[]>;
export type TCalculatePriceEntity = TResponse<ICalculatePriceResult>;
export type TSalonAvailableSlotsEntity = TResponse<ISalonAvailableSlots>;
