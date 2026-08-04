import { TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface ICreateTipRequest {
  staffMemberId: number;
  amount: number;
  appointmentId?: number;
  paymentId?: number;
}

export interface ITip {
  id: number;
  staffMemberId: number;
  amount: number;
  appointmentId?: number | null;
  paymentId?: number | null;
  createdAt?: string | null;
}

export type TTipEntity = TResponse<ITip>;
export type TTipsEntity = TResponse<ITip[]>;

