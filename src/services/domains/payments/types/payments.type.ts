import { TPagedResult, TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface ICreatePaymentRequest {
  invoiceId: number;
  amount: number;
  paymentMethod: number;
  paymentType?: number;
  idempotencyKey: string;
  gatewayName?: string | null;
  gatewayRef?: string | null;
  receiptNumber?: string | null;
}

export interface IPaymentResult {
  paymentId: number;
  invoiceId: number;
  amount: number;
  paymentMethod: number;
  invoiceStatus?: number;
  invoiceOutstanding?: number;
  isDuplicate?: boolean;
}

export interface IRefundPaymentRequest {
  paymentId: number;
  amount: number;
  reason?: string | null;
}

export interface IPaymentListItem {
  id: number;
  amount: number;
  paymentMethod: number;
  createdAt?: string;
}

export type TPaymentResultEntity = TResponse<IPaymentResult>;
export type TPaymentsEntity = TResponse<IPaymentListItem[]>;


/** GET /api/payments row — a payment received in the period (owner only). */
export interface IReceivedPayment {
  id: number;
  publicId: string;
  at: string;
  method: number;
  type: number;
  status: number;
  amount: number;
  refundedAmount: number;
  customerName: string | null;
  appointmentPublicId: string | null;
  invoiceId: number | null;
  invoicePublicId: string | null;
}

export type TReceivedPaymentsEntity = TResponse<TPagedResult<IReceivedPayment>>;
