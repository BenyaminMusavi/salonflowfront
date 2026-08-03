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

/** Branch catalog line — prefer offeringId/serviceTypeId when API sends them. */
export interface IBranchService {
  servicePublicId: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  durationMinutes: number;
  price: number;
  requiresDeposit: boolean;
  depositAmount?: number | null;
  /** ServiceOffering.Id (long) — required for create */
  offeringId?: number | null;
  /** ServiceType.Id (long) — required for dates/price/slots */
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
}

export interface ISalonAvailableSlots {
  staffProfilePublicId?: string | null;
  slots: ISalonBrowseSlot[];
}

export interface IGetSalonAvailableSlotsParams {
  branchId: number;
  date: string;
  serviceTypeIds: number[];
  staffProfilePublicId?: string | null;
}

export type TBranchServicesEntity = TResponse<IBranchService[]>;
export type TAvailableDatesEntity = TResponse<IAvailableDate[]>;
export type TStaffAvailabilityEntity = TResponse<IStaffAvailability[]>;
export type TCalculatePriceEntity = TResponse<ICalculatePriceResult>;
export type TSalonAvailableSlotsEntity = TResponse<ISalonAvailableSlots>;
