"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import walletsService from "../wallets.service";
import { IWalletOperationRequest } from "../types/wallets.type";

export const WALLET_ME_QUERY_KEY = "WALLET_ME_QUERY_KEY";
export const WALLET_ME_TRANSACTIONS_QUERY_KEY = "WALLET_ME_TRANSACTIONS_QUERY_KEY";
export const WALLET_BY_CUSTOMER_QUERY_KEY = "WALLET_BY_CUSTOMER_QUERY_KEY";
export const WALLET_TRANSACTIONS_QUERY_KEY = "WALLET_TRANSACTIONS_QUERY_KEY";

export const useQueryMyWallet = () => {
  return useQuery({
    queryKey: [WALLET_ME_QUERY_KEY],
    queryFn: () => walletsService.getMine(),
  });
};

export const useQueryMyWalletTransactions = () => {
  return useQuery({
    queryKey: [WALLET_ME_TRANSACTIONS_QUERY_KEY],
    queryFn: () => walletsService.getMyTransactions(),
  });
};

export const useQueryWalletByCustomer = (customerId: number | undefined) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [WALLET_BY_CUSTOMER_QUERY_KEY, salonId, customerId],
    queryFn: () => walletsService.getByCustomer(customerId!),
    enabled: !!salonId && !!customerId,
  });
};

export const useQueryWalletTransactions = (customerId: number | undefined) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [WALLET_TRANSACTIONS_QUERY_KEY, salonId, customerId],
    queryFn: () => walletsService.getTransactions(customerId!),
    enabled: !!salonId && !!customerId,
  });
};

export const useMutateWallet = () => {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [WALLET_BY_CUSTOMER_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [WALLET_TRANSACTIONS_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [WALLET_ME_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [WALLET_ME_TRANSACTIONS_QUERY_KEY] });
  };

  return {
    charge: useMutation({
      mutationFn: (body: IWalletOperationRequest) => walletsService.charge(body),
      onSuccess: invalidate,
    }),
    debit: useMutation({
      mutationFn: (body: IWalletOperationRequest) => walletsService.debit(body),
      onSuccess: invalidate,
    }),
  };
};

