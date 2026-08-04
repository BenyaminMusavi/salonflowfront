"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import payoutsService from "../payouts.service";
import { ICreatePayoutRequest } from "../types/payouts.type";

export const EARNINGS_QUERY_KEY = "EARNINGS_QUERY_KEY";
export const PAYOUTS_BY_STAFF_QUERY_KEY = "PAYOUTS_BY_STAFF_QUERY_KEY";

export const useQueryEarnings = (params?: {
  staffMemberId?: number;
  status?: number;
  page?: number;
  pageSize?: number;
}) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [EARNINGS_QUERY_KEY, salonId, params],
    queryFn: () => payoutsService.getEarnings(params),
    enabled: !!salonId,
  });
};

export const useQueryPayoutsByStaff = (staffMemberId: number | undefined) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [PAYOUTS_BY_STAFF_QUERY_KEY, salonId, staffMemberId],
    queryFn: () => payoutsService.getPayoutsByStaff(staffMemberId!),
    enabled: !!salonId && !!staffMemberId,
  });
};

export const useMutatePayouts = () => {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [EARNINGS_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [PAYOUTS_BY_STAFF_QUERY_KEY] });
  };

  return {
    approveEarning: useMutation({
      mutationFn: (id: number) => payoutsService.approveEarning(id),
      onSuccess: invalidate,
    }),
    createPayout: useMutation({
      mutationFn: (body: ICreatePayoutRequest) => payoutsService.createPayout(body),
      onSuccess: invalidate,
    }),
    approvePayout: useMutation({
      mutationFn: (id: number) => payoutsService.approvePayout(id),
      onSuccess: invalidate,
    }),
    markPaid: useMutation({
      mutationFn: ({ id, method }: { id: number; method: number }) =>
        payoutsService.markPayoutPaid(id, method),
      onSuccess: invalidate,
    }),
  };
};

