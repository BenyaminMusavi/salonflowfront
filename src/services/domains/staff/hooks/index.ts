"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import staffService from "../staff.service";
import type {
  IInviteStaffRequest,
  IScheduleExceptionRequest,
  IUpdateStaffRequest,
  IWeeklyDay,
} from "../types/staff.type";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { STAFF_ROSTER_QUERY_KEY } from "@/services/domains/salons/hooks/useQueryStaffRoster";
import { STAFF_FOR_OFFERINGS_QUERY_KEY } from "@/services/domains/staff-profile/hooks/useQueryStaffForOfferings";
import { WORKING_SCHEDULES_QUERY_KEY } from "@/services/domains/working-schedules/hooks";
import { SPECIAL_SCHEDULES_QUERY_KEY } from "@/services/domains/special-schedules/hooks";

export const STAFF_LIST_QUERY_KEY = "STAFF_LIST_QUERY_KEY";
export const MY_STAFF_QUERY_KEY = "MY_STAFF_QUERY_KEY";
export const TEAM_SCHEDULE_QUERY_KEY = "TEAM_SCHEDULE_QUERY_KEY";

const PEOPLE_KEYS = [STAFF_LIST_QUERY_KEY, STAFF_ROSTER_QUERY_KEY, STAFF_FOR_OFFERINGS_QUERY_KEY, TEAM_SCHEDULE_QUERY_KEY];
const SCHEDULE_KEYS = [WORKING_SCHEDULES_QUERY_KEY, SPECIAL_SCHEDULES_QUERY_KEY, TEAM_SCHEDULE_QUERY_KEY, STAFF_LIST_QUERY_KEY];

/** Everyone in the salon with branch, invitation state, service count and today's hours (owner only). */
export const useQueryStaffList = (options?: { enabled?: boolean }) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [STAFF_LIST_QUERY_KEY, salonId],
    queryFn: () => staffService.list(),
    enabled: !!salonId && (options?.enabled ?? true),
  });
};

/** The caller's own staff member in this salon (404 when they are not staff here). */
export const useQueryMyStaff = () => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [MY_STAFF_QUERY_KEY, salonId],
    queryFn: () => staffService.me(),
    enabled: !!salonId,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

/** Everyone's hours per day for `from`…`to` (≤ 31 days). */
export const useQueryTeamSchedule = (from: string, to: string) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [TEAM_SCHEDULE_QUERY_KEY, salonId, from, to],
    queryFn: () => staffService.team(from, to),
    enabled: !!salonId,
  });
};

export const useQueryStaffRemovalImpact = (publicId: string | null) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: ["STAFF_REMOVAL_IMPACT", salonId, publicId],
    queryFn: () => staffService.removalImpact(publicId!),
    enabled: !!salonId && !!publicId,
    staleTime: 0,
    gcTime: 0,
  });
};

export const useMutateStaff = () => {
  const queryClient = useQueryClient();
  const refresh = (keys: string[]) => keys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));

  return {
    invite: useMutation({
      mutationFn: (body: IInviteStaffRequest) => staffService.invite(body),
      onSuccess: () => refresh(PEOPLE_KEYS),
    }),
    update: useMutation({
      mutationFn: ({ publicId, body }: { publicId: string; body: IUpdateStaffRequest }) =>
        staffService.update(publicId, body),
      onSuccess: () => refresh(PEOPLE_KEYS),
    }),
    remove: useMutation({
      mutationFn: (publicId: string) => staffService.remove(publicId),
      // Their future appointments are cancelled server-side.
      onSuccess: () => refresh([...PEOPLE_KEYS, "AGENDA_QUERY_KEY"]),
    }),
    resend: useMutation({
      mutationFn: (publicId: string) => staffService.resendInvitation(publicId),
    }),
    saveWeekly: useMutation({
      mutationFn: ({ publicId, days }: { publicId: string; days: IWeeklyDay[] }) =>
        staffService.saveWeekly(publicId, days),
      onSuccess: () => refresh(SCHEDULE_KEYS),
    }),
    addException: useMutation({
      mutationFn: ({ publicId, body }: { publicId: string; body: IScheduleExceptionRequest }) =>
        staffService.addException(publicId, body),
      onSuccess: () => refresh(SCHEDULE_KEYS),
    }),
  };
};
