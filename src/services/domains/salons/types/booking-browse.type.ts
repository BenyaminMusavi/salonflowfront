import { TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface ISalonBranch {
  id: number;
  publicId?: string | null;
  name: string;
  city?: string | null;
  address?: string | null;
  phone?: string | null;
  genderType?: number | string | null;
}

/** Branch catalog line — prefer Guid public ids for customer booking. */
export interface IBranchService {
  servicePublicId: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  durationMinutes: number;
  price: number;
  requiresDeposit: boolean;
  depositAmount?: number | null;
  /** ServiceOffering.PublicId — required for create/slots */
  offeringPublicId?: string | null;
  /** @deprecated Prefer offeringPublicId */
  offeringId?: number | null;
  /** ServiceType.Id (long) — legacy browse until Guid migration */
  serviceTypeId?: number | null;
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
  /** StaffMember.Id when API includes it */
  staffId?: number | null;
  staffMemberId?: number | null;
}

export interface IPriceLine {
  serviceTypeId: number;
  serviceName: string;
  price: number;
  requiresDeposit: boolean;
  depositAmount?: number | null;
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
  /** Present when API assigns staff per slot */
  staffProfilePublicId?: string | null;
  staffId?: number | null;
  staffProfileId?: number | null;
}

export interface ISalonAvailableSlots {
  /** Assigned staff when request used first-available (null staff) */
  staffProfilePublicId?: string | null;
  staffId?: number | null;
  staffProfileId?: number | null;
  slots: ISalonBrowseSlot[];
}

export interface IGetSalonAvailableSlotsParams {
  branchPublicId: string;
  date: string;
  serviceTypePublicIds: string[];
  staffProfilePublicId?: string | null;
}

export type TBranchServicesEntity = TResponse<IBranchService[]>;
export type TAvailableDatesEntity = TResponse<IAvailableDate[]>;
export type TStaffAvailabilityEntity = TResponse<IStaffAvailability[]>;
export type TCalculatePriceEntity = TResponse<ICalculatePriceResult>;
export type TSalonAvailableSlotsEntity = TResponse<ISalonAvailableSlots>;
