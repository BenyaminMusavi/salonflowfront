"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import appointmentsService from "../appointments.service";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import type { IAppointmentHistoryQuery } from "../types/appointments.type";

export const MY_STAFF_APPOINTMENTS_QUERY_KEY = "MY_STAFF_APPOINTMENTS_QUERY_KEY";
export const CUSTOMER_APPOINTMENTS_QUERY_KEY = "CUSTOMER_APPOINTMENTS_QUERY_KEY";
export const STAFF_APPOINTMENTS_QUERY_KEY = "STAFF_APPOINTMENTS_QUERY_KEY";

/** Salon-context JWT: appointments of the current salon served by the caller (Staff or SalonOwner). */
export const useQueryMyStaffAppointments = (query: IAppointmentHistoryQuery) => {
  const salonId = useSalonContextStore((s) => s.salonId);

  return useQuery({
    queryKey: [MY_STAFF_APPOINTMENTS_QUERY_KEY, salonId, query],
    queryFn: () => appointmentsService.getMyStaffAppointments(query),
    enabled: salonId != null,
    placeholderData: keepPreviousData,
  });
};

/** Salon-context JWT (SalonOwner/Staff): one customer's appointments in the current salon. */
export const useQueryCustomerAppointments = (
  customerPublicId: string | undefined,
  query: IAppointmentHistoryQuery
) => {
  const salonId = useSalonContextStore((s) => s.salonId);

  return useQuery({
    queryKey: [CUSTOMER_APPOINTMENTS_QUERY_KEY, salonId, customerPublicId, query],
    queryFn: () =>
      appointmentsService.getCustomerAppointments(customerPublicId!, query),
    enabled: salonId != null && !!customerPublicId,
    placeholderData: keepPreviousData,
  });
};

/** Salon-context JWT (SalonOwner only): one staff member's appointments in the current salon. */
export const useQueryStaffAppointments = (
  staffPublicId: string | undefined,
  query: IAppointmentHistoryQuery,
  options?: { enabled?: boolean }
) => {
  const salonId = useSalonContextStore((s) => s.salonId);

  return useQuery({
    queryKey: [STAFF_APPOINTMENTS_QUERY_KEY, salonId, staffPublicId, query],
    queryFn: () => appointmentsService.getStaffAppointments(staffPublicId!, query),
    enabled: (options?.enabled ?? true) && salonId != null && !!staffPublicId,
    placeholderData: keepPreviousData,
  });
};
