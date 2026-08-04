"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import appointmentsService from "../appointments.service";
import { SALON_APPOINTMENTS_QUERY_KEY } from "./useQuerySalonAppointments";

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
      queryClient.invalidateQueries({ queryKey: [SALON_APPOINTMENTS_QUERY_KEY] });
    },
  });
};

