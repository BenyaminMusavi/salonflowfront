import { TResponse } from "@/services/common/data-types/SharedDataTypes";

/** Backend `CommissionScope`. */
export enum CommissionScope {
  SalonDefault = 1,
  Staff = 2,
  ServiceType = 3,
}

/** Backend `CommissionCalculationType` (Tiered is not offered in the panel). */
export enum CommissionCalculationType {
  Percentage = 1,
  Fixed = 2,
  Tiered = 3,
}

export interface ICommissionRule {
  id: number;
  scope: CommissionScope | number;
  staffMemberId?: number | null;
  /** Numeric ServiceType id (the offering's `serviceTypeId`). */
  serviceTypeId?: number | null;
  calculationType: CommissionCalculationType | number;
  /** Percentage: 0–100. Fixed: Toman per service. */
  value: number;
  appliesToTips: boolean;
}

export interface ICommissionPlan {
  id: number;
  name: string;
  isActive: boolean;
  rules: ICommissionRule[];
}

export interface ICommissionRuleRequest {
  scope: CommissionScope;
  staffMemberId?: number | null;
  serviceTypeId?: number | null;
  calculationType: CommissionCalculationType;
  value: number;
  appliesToTips: boolean;
}

export type TCommissionPlansEntity = TResponse<ICommissionPlan[]>;
export type TCommissionPlanEntity = TResponse<ICommissionPlan>;
export type TCommissionRuleEntity = TResponse<ICommissionRule>;
