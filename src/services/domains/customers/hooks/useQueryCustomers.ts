"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import customersService from "../customers.service";
import type { IPatchCustomerRequest, TCustomerSegment, TCustomerSort } from "../types/customers.type";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";

export const CUSTOMERS_QUERY_KEY = "CUSTOMERS_QUERY_KEY";
export const CUSTOMER_DETAILS_QUERY_KEY = "CUSTOMER_DETAILS_QUERY_KEY";

export const useQueryCustomers = (
  search?: string,
  page = 1,
  options?: { segment?: TCustomerSegment; sort?: TCustomerSort }
) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  const segment = options?.segment ?? "all";
  const sort = options?.sort;

  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEY, salonId, search ?? "", page, segment, sort ?? ""],
    queryFn: () => customersService.list({ search, page, segment, sort }),
    enabled: !!salonId,
  });
};

/** This salon's file on one customer: phone, salon note, stats and upcoming appointments. */
export const useQueryCustomerDetails = (publicId: string | null | undefined) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [CUSTOMER_DETAILS_QUERY_KEY, salonId, publicId],
    queryFn: () => customersService.getDetails(publicId!),
    enabled: !!salonId && !!publicId,
  });
};

export const useMutatePatchCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, body }: { publicId: string; body: IPatchCustomerRequest }) =>
      customersService.patch(publicId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMER_DETAILS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY] });
    },
  });
};
