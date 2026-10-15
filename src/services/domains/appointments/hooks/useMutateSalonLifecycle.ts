"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import appointmentsService from "../appointments.service";
import { SALON_APPOINTMENTS_QUERY_KEY } from "./useQuerySalonAppointments";
import { BRANCH_DAY_BOARD_QUERY_KEY } from "./useQueryBranchDayBoard";
import { AGENDA_QUERY_KEY } from "./useQueryAgenda";
import {
  CUSTOMER_APPOINTMENTS_QUERY_KEY,
  MY_STAFF_APPOINTMENTS_QUERY_KEY,
  STAFF_APPOINTMENTS_QUERY_KEY,
} from "./useQueryAppointmentHistory";
import { APPOINTMENT_KEYS, MONEY_KEYS } from "./useSalonAppointment";

export const useMutateSalonLifecycle = () => {
  const queryClient = useQueryClient();

  // Every source the appointments page (useQueryAgenda) and the staff grid read from, plus the open
  // details / deposit views; a status change that settles money also refreshes the reports.
  const invalidate = (withMoney = false) =>
    Promise.all(
      Array.from(
        new Set([
          SALON_APPOINTMENTS_QUERY_KEY,
          AGENDA_QUERY_KEY,
          BRANCH_DAY_BOARD_QUERY_KEY,
          MY_STAFF_APPOINTMENTS_QUERY_KEY,
          CUSTOMER_APPOINTMENTS_QUERY_KEY,
          STAFF_APPOINTMENTS_QUERY_KEY,
          ...APPOINTMENT_KEYS,
          ...(withMoney ? MONEY_KEYS : []),
        ])
      ).map((key) => queryClient.invalidateQueries({ queryKey: [key] }))
    );

  const checkIn = useMutation({
    mutationFn: (id: number) => appointmentsService.checkIn(id),
    onSuccess: () => invalidate(),
  });

  const complete = useMutation({
    mutationFn: (id: number) => appointmentsService.complete(id),
    onSuccess: () => invalidate(true),
  });

  const noShow = useMutation({
    mutationFn: ({ id, notifyCustomer }: { id: number; notifyCustomer: boolean }) =>
      appointmentsService.noShow(id, { notifyCustomer }),
    onSuccess: () => invalidate(true),
  });

  const cancel = useMutation({
    mutationFn: ({
      id,
      reason,
      notifyCustomer,
    }: {
      id: number;
      reason: string;
      notifyCustomer: boolean;
    }) => appointmentsService.cancel(id, { reason, notifyCustomer }),
    onSuccess: () => invalidate(true),
  });

  const reschedule = useMutation({
    mutationFn: ({
      id,
      newStartTime,
      notifyCustomer,
    }: {
      id: number;
      newStartTime: string;
      notifyCustomer: boolean;
    }) => appointmentsService.reschedule(id, { newStartTime, notifyCustomer }),
    onSuccess: () => invalidate(),
  });

  return { checkIn, complete, noShow, cancel, reschedule };
};

