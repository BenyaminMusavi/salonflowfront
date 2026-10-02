"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import appointmentsService from "../appointments.service";
import type { ICheckoutRequest, IGuidRescheduleRequest, ISalonAvailabilityParams } from "../types/appointments.type";
import { AGENDA_QUERY_KEY } from "./useQueryAgenda";
import { SALON_APPOINTMENTS_QUERY_KEY } from "./useQuerySalonAppointments";
import { BRANCH_DAY_BOARD_QUERY_KEY } from "./useQueryBranchDayBoard";
import {
  CUSTOMER_APPOINTMENTS_QUERY_KEY,
  MY_STAFF_APPOINTMENTS_QUERY_KEY,
  STAFF_APPOINTMENTS_QUERY_KEY,
} from "./useQueryAppointmentHistory";
import { INVOICES_QUERY_KEY } from "@/services/domains/invoices/hooks";
import {
  DASHBOARD_SUMMARY_QUERY_KEY,
  REPORTS_QUERY_KEY,
  Z_REPORT_QUERY_KEY,
} from "@/services/domains/reports/hooks";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";

export const SALON_APPOINTMENT_DETAILS_QUERY_KEY = "SALON_APPOINTMENT_DETAILS_QUERY_KEY";
export const SALON_AVAILABILITY_QUERY_KEY = "SALON_AVAILABILITY_QUERY_KEY";

/** Every list an appointment appears in, plus money views a checkout moves. */
const APPOINTMENT_KEYS = [
  SALON_APPOINTMENT_DETAILS_QUERY_KEY,
  AGENDA_QUERY_KEY,
  SALON_APPOINTMENTS_QUERY_KEY,
  BRANCH_DAY_BOARD_QUERY_KEY,
  MY_STAFF_APPOINTMENTS_QUERY_KEY,
  CUSTOMER_APPOINTMENTS_QUERY_KEY,
  STAFF_APPOINTMENTS_QUERY_KEY,
];
const MONEY_KEYS = [INVOICES_QUERY_KEY, Z_REPORT_QUERY_KEY, DASHBOARD_SUMMARY_QUERY_KEY, REPORTS_QUERY_KEY];

/** Salon-side details of one appointment (customer phone, money, notes, allowed actions). */
export const useQuerySalonAppointmentDetails = (publicId: string | null | undefined) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [SALON_APPOINTMENT_DETAILS_QUERY_KEY, salonId, publicId],
    queryFn: () => appointmentsService.getSalonDetails(publicId!),
    enabled: !!salonId && !!publicId,
  });
};

/** Free salon-side slots (no online-booking limits) — new appointment and reschedule. Never cached. */
export const useQuerySalonAvailability = (
  params: ISalonAvailabilityParams | null,
  options?: { enabled?: boolean }
) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [SALON_AVAILABILITY_QUERY_KEY, salonId, params],
    queryFn: () => appointmentsService.getSalonAvailability(params!),
    enabled: !!salonId && !!params && params.offeringPublicIds.length > 0 && (options?.enabled ?? true),
    staleTime: 0,
    gcTime: 0,
  });
};

export const useMutateSalonAppointment = () => {
  const queryClient = useQueryClient();
  const refresh = (withMoney = false) => {
    for (const key of withMoney ? [...APPOINTMENT_KEYS, ...MONEY_KEYS] : APPOINTMENT_KEYS) {
      queryClient.invalidateQueries({ queryKey: [key] });
    }
  };

  return {
    checkIn: useMutation({
      mutationFn: (publicId: string) => appointmentsService.checkInByPublicId(publicId),
      onSuccess: () => refresh(),
    }),
    complete: useMutation({
      mutationFn: (publicId: string) => appointmentsService.completeByPublicId(publicId),
      onSuccess: () => refresh(true),
    }),
    noShow: useMutation({
      mutationFn: ({ publicId, notifyCustomer }: { publicId: string; notifyCustomer: boolean }) =>
        appointmentsService.noShowByPublicId(publicId, notifyCustomer),
      onSuccess: () => refresh(),
    }),
    cancel: useMutation({
      mutationFn: ({ publicId, reason, notifyCustomer }: { publicId: string; reason: string; notifyCustomer: boolean }) =>
        appointmentsService.cancelByPublicId(publicId, { reason, notifyCustomer }),
      onSuccess: () => refresh(),
    }),
    reschedule: useMutation({
      mutationFn: ({ publicId, body }: { publicId: string; body: IGuidRescheduleRequest }) =>
        appointmentsService.rescheduleByPublicId(publicId, body),
      onSuccess: () => refresh(),
    }),
    undo: useMutation({
      mutationFn: (publicId: string) => appointmentsService.undoStatus(publicId),
      onSuccess: () => refresh(true),
    }),
    checkout: useMutation({
      mutationFn: ({ publicId, body }: { publicId: string; body: ICheckoutRequest }) =>
        appointmentsService.checkout(publicId, body),
      onSuccess: () => refresh(true),
    }),
    internalNote: useMutation({
      mutationFn: ({ publicId, note }: { publicId: string; note: string | null }) =>
        appointmentsService.setInternalNote(publicId, note),
      onSuccess: () => refresh(),
    }),
  };
};
