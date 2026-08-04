"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import tipsService from "../tips.service";
import { ICreateTipRequest } from "../types/tips.type";

export const TIPS_BY_APPOINTMENT_QUERY_KEY = "TIPS_BY_APPOINTMENT_QUERY_KEY";

export const useQueryTipsByAppointment = (appointmentId: number | undefined) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [TIPS_BY_APPOINTMENT_QUERY_KEY, salonId, appointmentId],
    queryFn: () => tipsService.getByAppointment(appointmentId!),
    enabled: !!salonId && !!appointmentId,
  });
};

export const useMutateTips = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ICreateTipRequest) => tipsService.create(body),
    onSuccess: (_data, variables) => {
      if (variables.appointmentId) {
        queryClient.invalidateQueries({
          queryKey: [TIPS_BY_APPOINTMENT_QUERY_KEY, undefined, variables.appointmentId],
        });
      }
      queryClient.invalidateQueries({ queryKey: [TIPS_BY_APPOINTMENT_QUERY_KEY] });
    },
  });
};

