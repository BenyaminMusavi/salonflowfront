"use client";

import { useQuery } from "@tanstack/react-query";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import reportsService from "../reports.service";

export const Z_REPORT_QUERY_KEY = "Z_REPORT_QUERY_KEY";

export const useQueryZReport = (date: string | undefined) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [Z_REPORT_QUERY_KEY, salonId, date],
    queryFn: () => reportsService.getZReport({ salonId: salonId!, date: date! }),
    enabled: !!salonId && !!date,
  });
};

