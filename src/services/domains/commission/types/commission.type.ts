import { TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface ICommissionPlan {
  id: number;
  name?: string;
  scope?: number;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface ICommissionRule {
  id: number;
  [key: string]: unknown;
}

export type TCommissionPlansEntity = TResponse<ICommissionPlan[]>;
export type TCommissionPlanEntity = TResponse<ICommissionPlan>;
export type TCommissionRuleEntity = TResponse<ICommissionRule>;

