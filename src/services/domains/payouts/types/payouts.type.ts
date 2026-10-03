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
  /** true = create and approve in one step. */
  approve?: boolean;
}

export interface IPayoutOverviewRow {
  staff: { publicId: string; staffMemberId: number; fullName: string | null };
  /** Services done in the period (commission base). */
  earned: number;
  /** Staff share (commission) in the period. */
  staffShare: number;
  /** Earnings not approved yet. */
  pendingCount: number;
  /** Approved and not paid out — what a payout for this period would make. */
  readyAmount: number;
  readyCount: number;
  lastPayoutAt: string | null;
}

export interface IPayoutPreview {
  amount: number;
  count: number;
  periodStart: string;
  periodEnd: string;
}

export interface IMyEarnings {
  earned: number;
  staffShare: number;
  payouts: { id: number; publicId: string; periodStart: string; periodEnd: string; status: number; totalAmount: number; paidAt: string | null }[];
}

export type TPayoutOverviewEntity = TResponse<IPayoutOverviewRow[]>;
export type TPayoutPreviewEntity = TResponse<IPayoutPreview>;
export type TMyEarningsEntity = TResponse<IMyEarnings>;

export type TEarningsEntity = TResponse<TPagedResult<IEarning>>;
export type TPayoutEntity = TResponse<IPayout>;
export type TPayoutsEntity = TResponse<IPayout[]>;

