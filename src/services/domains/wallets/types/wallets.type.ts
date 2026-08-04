import { TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface IWallet {
  customerId?: number;
  balance: number;
  currency?: string | null;
}

export interface IWalletTransaction {
  id: number;
  amount: number;
  type?: number;
  description?: string | null;
  createdAt?: string | null;
}

export interface IWalletOperationRequest {
  customerId: number;
  amount: number;
  description?: string | null;
}

export type TWalletEntity = TResponse<IWallet>;
export type TWalletTransactionsEntity = TResponse<IWalletTransaction[]>;

