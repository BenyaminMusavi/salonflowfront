"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import invoicesService from "../invoices.service";
import { ICreateInvoiceItemRequest } from "../types/invoices.type";

export const INVOICES_QUERY_KEY = "INVOICES_QUERY_KEY";
export const INVOICE_QUERY_KEY = "INVOICE_QUERY_KEY";

export const useQueryInvoices = (params?: {
  status?: number;
  page?: number;
  pageSize?: number;
}) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [INVOICES_QUERY_KEY, salonId, params],
    queryFn: () => invoicesService.list(params),
    enabled: !!salonId,
  });
};

export const useQueryInvoiceById = (id: number | undefined) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [INVOICE_QUERY_KEY, salonId, id],
    queryFn: () => invoicesService.getById(id!),
    enabled: !!salonId && !!id,
  });
};

export const useMutateInvoices = () => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] });

  return {
    createFromAppointment: useMutation({
      mutationFn: (appointmentId: number) =>
        invoicesService.createFromAppointment(appointmentId),
      onSuccess: invalidate,
    }),
    addItem: useMutation({
      mutationFn: ({ id, body }: { id: number; body: ICreateInvoiceItemRequest }) =>
        invoicesService.addItem(id, body),
      onSuccess: invalidate,
    }),
    deleteItem: useMutation({
      mutationFn: ({ id, itemId }: { id: number; itemId: number }) =>
        invoicesService.deleteItem(id, itemId),
      onSuccess: invalidate,
    }),
    cancel: useMutation({
      mutationFn: (id: number) => invoicesService.cancel(id),
      onSuccess: invalidate,
    }),
  };
};

