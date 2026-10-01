"use client";

import { useQuery } from "@tanstack/react-query";
import walletsService from "../wallets.service";

export const WALLET_ME_QUERY_KEY = "WALLET_ME_QUERY_KEY";
export const WALLET_ME_TRANSACTIONS_QUERY_KEY = "WALLET_ME_TRANSACTIONS_QUERY_KEY";

export const useQueryMyWallet = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [WALLET_ME_QUERY_KEY],
    queryFn: () => walletsService.getMine(),
    enabled: options?.enabled ?? true,
  });
};

export const useQueryMyWalletTransactions = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [WALLET_ME_TRANSACTIONS_QUERY_KEY],
    queryFn: () => walletsService.getMyTransactions(),
    enabled: options?.enabled ?? true,
  });
};
