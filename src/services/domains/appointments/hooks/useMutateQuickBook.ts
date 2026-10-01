"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import appointmentsService from "../appointments.service";
import { SALON_APPOINTMENTS_QUERY_KEY } from "./useQuerySalonAppointments";
import { BRANCH_DAY_BOARD_QUERY_KEY } from "./useQueryBranchDayBoard";
import { MY_STAFF_APPOINTMENTS_QUERY_KEY } from "./useQueryAppointmentHistory";

export const useMutateQuickBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      phone,
      fullName,
      branchId,
      startTime,
      notes,
      services,
    }: {
      phone: string;
      fullName: string;
      branchId: number;
      startTime: string;
      notes?: string | null;
      services: { offeringId: number; staffId: number }[];
    }) =>
      appointmentsService.quickBook({
        phone,
        fullName,
        branchId,
        startTime,
        notes,
        services,
      }),
    onSuccess: () => {
      for (const key of [SALON_APPOINTMENTS_QUERY_KEY, BRANCH_DAY_BOARD_QUERY_KEY, MY_STAFF_APPOINTMENTS_QUERY_KEY]) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    },
  });
};

