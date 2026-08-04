"use client";

import { useQuery } from "@tanstack/react-query";
import customersService from "../customers.service";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";

export const CUSTOMERS_QUERY_KEY = "CUSTOMERS_QUERY_KEY";

export const useQueryCustomers = (search?: string) => {
  const salonId = useSalonContextStore((s) => s.salonId);

  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEY, salonId, search ?? ""],
    queryFn: () => customersService.list({ search }),
    enabled: !!salonId,
  });
};

