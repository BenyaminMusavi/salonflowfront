import { useMutation, useQueryClient } from "@tanstack/react-query";
import appointmentsService from "../appointments.service";
import { ICancelAppointmentRequest } from "../types/appointments.type";
import { MY_APPOINTMENTS_QUERY_KEY } from "./useQueryMyAppointments";
import { MY_APPOINTMENT_DETAIL_QUERY_KEY } from "./useQueryMyAppointmentById";

export const useMutateCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      reason,
    }: {
      id: number;
      reason: string;
    } & Partial<ICancelAppointmentRequest>) =>
      appointmentsService.cancel(id, { reason }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [MY_APPOINTMENTS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [MY_APPOINTMENT_DETAIL_QUERY_KEY, variables.id],
      });
    },
  });
};
