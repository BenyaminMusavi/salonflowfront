"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import appointmentsService from "../appointments.service";
import { SALON_APPOINTMENTS_QUERY_KEY } from "./useQuerySalonAppointments";

export const useMutateSalonLifecycle = () => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [SALON_APPOINTMENTS_QUERY_KEY] });

  const checkIn = useMutation({
    mutationFn: (id: number) => appointmentsService.checkIn(id),
    onSuccess: invalidate,
  });

  const complete = useMutation({
    mutationFn: (id: number) => appointmentsService.complete(id),
    onSuccess: invalidate,
  });

  const noShow = useMutation({
    mutationFn: (id: number) => appointmentsService.noShow(id),
    onSuccess: invalidate,
  });

  const cancel = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      appointmentsService.cancel(id, { reason }),
    onSuccess: invalidate,
  });

  return { checkIn, complete, noShow, cancel };
};

