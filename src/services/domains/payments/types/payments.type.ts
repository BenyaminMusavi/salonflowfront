import { TPagedResult, TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface ICreatePaymentRequest {
  invoiceId: number;
  amount: number;
  paymentMethod: number;
  /** 1 = Appointment, 3 = Full — deposits and penalties are recorded by the system. */
  paymentType?: 1 | 3;
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

/** Owner only. Both `reason` and `idempotencyKey` are required — send a new GUID per button press. */
export interface IRefundPaymentRequest {
  paymentId: number;
  amount: number;
  reason: string;
  idempotencyKey: string;
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
