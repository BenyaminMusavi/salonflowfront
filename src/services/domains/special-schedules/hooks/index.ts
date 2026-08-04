"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import specialSchedulesService from "../special-schedules.service";
import { ISpecialScheduleRequest } from "../types/special-schedules.type";

const SPECIAL_SCHEDULES_QUERY_KEY = "SPECIAL_SCHEDULES_QUERY_KEY";

export const useQuerySpecialSchedules = (
  staffMemberId: number | undefined,
  params?: { from?: string; to?: string }
) => {
  const salonId = useSalonContextStore((s) => s.salonId);

  return useQuery({
    queryKey: [SPECIAL_SCHEDULES_QUERY_KEY, salonId, staffMemberId, params],
    queryFn: () => specialSchedulesService.listByStaff(staffMemberId!, params),
    enabled: !!salonId && !!staffMemberId,
  });
};

export const useMutateSpecialSchedules = () => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [SPECIAL_SCHEDULES_QUERY_KEY] });

  return {
    create: useMutation({
      mutationFn: (body: ISpecialScheduleRequest) => specialSchedulesService.create(body),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: number; body: ISpecialScheduleRequest }) =>
        specialSchedulesService.update(id, body),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: number) => specialSchedulesService.remove(id),
      onSuccess: invalidate,
    }),
  };
};

