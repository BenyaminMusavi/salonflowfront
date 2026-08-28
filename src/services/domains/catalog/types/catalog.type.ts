import { TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface IServiceOffering {
  id: number;
  /** ServiceOffering.PublicId — the Guid save-staff/staff-for-offerings/booking expect. */
  publicId: string;
  salonId: number;
  branchId?: number | null;
  serviceTypeId: number;
  serviceTypeName: string;
  durationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  basePrice: number;
  depositAmount?: number | null;
  isActive: boolean;
  isOnlineBookable: boolean;
  requiresDeposit: boolean;
  color?: string | null;
}

export interface ICreateOrUpdateOfferingRequest {
  serviceTypeId: number;
  branchId?: number | null;
  durationMinutes: number;
  basePrice: number;
  bufferBeforeMinutes?: number;
  bufferAfterMinutes?: number;
  isOnlineBookable?: boolean;
  requiresDeposit?: boolean;
  depositAmount?: number | null;
  color?: string | null;
}

export interface IStaffService {
  id: number;
  staffMemberId: number;
  /** Guid form of staffMemberId — added so this page never has to fetch SalonById just to resolve one. */
  staffMemberPublicId?: string | null;
  staffName?: string | null;
  serviceOfferingId: number;
  /** Guid form of serviceOfferingId. */
  serviceOfferingPublicId?: string | null;
  customDurationMinutes?: number | null;
  customPrice?: number | null;
  isActive: boolean;
}

export interface IStaffServicesSyncRequest {
  services: Array<{
    serviceOfferingId: number;
    customPrice?: number | null;
    customDurationMinutes?: number | null;
    isActive: boolean;
  }>;
}

export interface IPricingRule {
  id: number;
  scopeType: number;
  [key: string]: unknown;
}

export type TCatalogOfferingsEntity = TResponse<IServiceOffering[]>;
export type TCatalogOfferingEntity = TResponse<IServiceOffering>;
export type TCatalogStaffServicesEntity = TResponse<IStaffService[]>;
export type TPricingRulesEntity = TResponse<IPricingRule[]>;
export type TPricingRuleEntity = TResponse<IPricingRule>;

