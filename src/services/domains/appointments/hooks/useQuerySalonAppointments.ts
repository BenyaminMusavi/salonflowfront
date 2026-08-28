"use client";

import { useQuery } from "@tanstack/react-query";
import appointmentsService from "../appointments.service";
import { ISalonAppointmentsQuery } from "../types/appointments.type";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";

export const SALON_APPOINTMENTS_QUERY_KEY = "SALON_APPOINTMENTS_QUERY_KEY";

export const useQuerySalonAppointments = (
  date: string,
  options?: Omit<ISalonAppointmentsQuery, "date" | "salonId">,
  config?: { enabled?: boolean }
) => {
  const salonId = useSalonContextStore((s) => s.salonId);

  return useQuery({
    queryKey: [SALON_APPOINTMENTS_QUERY_KEY, salonId, date, options],
    queryFn: () =>
      appointmentsService.getSalonAppointments({
        salonId: salonId ?? undefined,
        date,
        ...options,
      }),
    enabled: !!salonId && !!date && (config?.enabled ?? true),
  });
};

