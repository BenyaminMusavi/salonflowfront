import { TResponse } from "@/services/common/data-types/SharedDataTypes";

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

