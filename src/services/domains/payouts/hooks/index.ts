"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import payoutsService from "../payouts.service";
import { ICreatePayoutRequest } from "../types/payouts.type";

export const EARNINGS_QUERY_KEY = "EARNINGS_QUERY_KEY";
export const PAYOUTS_BY_STAFF_QUERY_KEY = "PAYOUTS_BY_STAFF_QUERY_KEY";
export const PAYOUT_OVERVIEW_QUERY_KEY = "PAYOUT_OVERVIEW_QUERY_KEY";
export const MY_EARNINGS_QUERY_KEY = "MY_EARNINGS_QUERY_KEY";

export const useQueryPayoutOverview = (range: { from: string; to: string }) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [PAYOUT_OVERVIEW_QUERY_KEY, salonId, range.from, range.to],
    queryFn: () => payoutsService.getOverview(range.from, range.to),
    enabled: !!salonId,
  });
};

/** Never cached: it must match what POST would group right now. */
export const useQueryPayoutPreview = (params: { staffPublicId: string; from: string; to: string } | null) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [PAYOUT_OVERVIEW_QUERY_KEY, "preview", salonId, params],
    queryFn: () => payoutsService.preview(params!.staffPublicId, params!.from, params!.to),
    enabled: !!salonId && !!params && params.from <= params.to,
    staleTime: 0,
    gcTime: 0,
  });
};

export const useQueryMyEarnings = (range: { from: string; to: string }) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [MY_EARNINGS_QUERY_KEY, salonId, range.from, range.to],
    queryFn: () => payoutsService.myEarnings(range.from, range.to),
    enabled: !!salonId,
  });
};

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
    queryClient.invalidateQueries({ queryKey: [PAYOUT_OVERVIEW_QUERY_KEY] });
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

