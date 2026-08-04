import { TPagedResult, TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface IEarning {
  id: number;
  appointmentServiceId?: number;
  staffMemberId: number;
  grossAmount: number;
  commissionAmount: number;
  status: number;
  payoutId?: number | null;
}

export interface IPayout {
  id: number;
  staffMemberId: number;
  periodStart?: string;
  periodEnd?: string;
  status?: number;
  totalAmount?: number;
}

export interface ICreatePayoutRequest {
  staffMemberId: number;
  periodStart: string;
  periodEnd: string;
}

export type TEarningsEntity = TResponse<TPagedResult<IEarning>>;
export type TPayoutEntity = TResponse<IPayout>;
export type TPayoutsEntity = TResponse<IPayout[]>;

