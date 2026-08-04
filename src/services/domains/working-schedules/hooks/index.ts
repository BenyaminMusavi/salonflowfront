"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import workingSchedulesService from "../working-schedules.service";
import { IWorkingScheduleRequest } from "../types/working-schedules.type";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";

const WORKING_SCHEDULES_QUERY_KEY = "WORKING_SCHEDULES_QUERY_KEY";

export const useQueryWorkingSchedules = (staffMemberId: number | undefined) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [WORKING_SCHEDULES_QUERY_KEY, salonId, staffMemberId],
    queryFn: () => workingSchedulesService.listByStaff(staffMemberId!),
    enabled: !!salonId && !!staffMemberId,
  });
};

export const useMutateWorkingSchedules = () => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [WORKING_SCHEDULES_QUERY_KEY] });

  return {
    create: useMutation({
      mutationFn: (body: IWorkingScheduleRequest) => workingSchedulesService.create(body),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: number; body: IWorkingScheduleRequest }) =>
        workingSchedulesService.update(id, body),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: number) => workingSchedulesService.remove(id),
      onSuccess: invalidate,
    }),
  };
};

