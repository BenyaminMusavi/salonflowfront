"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import paymentsService from "../payments.service";
import { ICreatePaymentRequest, IRefundPaymentRequest } from "../types/payments.type";

export const PAYMENTS_BY_INVOICE_QUERY_KEY = "PAYMENTS_BY_INVOICE_QUERY_KEY";

export function generateIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `pm-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const useQueryPaymentsByInvoice = (invoiceId: number | undefined) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [PAYMENTS_BY_INVOICE_QUERY_KEY, salonId, invoiceId],
    queryFn: () => paymentsService.getByInvoice(invoiceId!),
    enabled: !!salonId && !!invoiceId,
  });
};

export const useMutatePayments = () => {
  const queryClient = useQueryClient();
  return {
    create: useMutation({
      mutationFn: (body: Omit<ICreatePaymentRequest, "idempotencyKey">) =>
        paymentsService.create({
          ...body,
          idempotencyKey: generateIdempotencyKey(),
        }),
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: [PAYMENTS_BY_INVOICE_QUERY_KEY, undefined, variables.invoiceId],
        });
        queryClient.invalidateQueries({ queryKey: [PAYMENTS_BY_INVOICE_QUERY_KEY] });
      },
    }),
    refund: useMutation({
      mutationFn: (body: IRefundPaymentRequest) => paymentsService.refund(body),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: [PAYMENTS_BY_INVOICE_QUERY_KEY] }),
    }),
  };
};

