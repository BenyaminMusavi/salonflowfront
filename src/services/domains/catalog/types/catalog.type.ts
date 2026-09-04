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

interface IOfferingRequestCommon {
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

/**
 * The service type can only be chosen at creation — the update endpoint has no field
 * for it at all (UpdateServiceOfferingRequest never had one; SF-QA-037/EPIC-01's F12).
 * ServiceTypePublicId (not a numeric id) because GET api/service-type only ever returns
 * the type's Guid PublicId under `id` — there is no numeric id a client could send here.
 */
export interface ICreateOfferingRequest extends IOfferingRequestCommon {
  serviceTypePublicId: string;
}

export type IUpdateOfferingRequest = IOfferingRequestCommon;

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

/** PricingPolicyType: 1 Standard (whole salon), 2 BranchSpecific, 3 StaffSpecific. */
export const PricingRuleScopeType = {
  Standard: 1,
  BranchSpecific: 2,
  StaffSpecific: 3,
} as const;

export interface IPricingRule {
  id: number;
  serviceTypeId: number;
  serviceOfferingId?: number | null;
  branchId?: number | null;
  staffMemberId?: number | null;
  price: number;
  durationMinutes?: number | null;
  isActive: boolean;
  validFrom?: string | null;
  validTo?: string | null;
  scopeType: number;
}

export interface ICreatePricingRuleRequest {
  serviceTypeId: number;
  scopeType: number;
  price: number;
  serviceOfferingId?: number | null;
  branchId?: number | null;
  staffMemberId?: number | null;
  durationMinutes?: number | null;
  validFrom?: string | null;
  validTo?: string | null;
}

export type TCatalogOfferingsEntity = TResponse<IServiceOffering[]>;
export type TCatalogOfferingEntity = TResponse<IServiceOffering>;
export type TCatalogStaffServicesEntity = TResponse<IStaffService[]>;
export type TPricingRulesEntity = TResponse<IPricingRule[]>;
export type TPricingRuleEntity = TResponse<IPricingRule>;

