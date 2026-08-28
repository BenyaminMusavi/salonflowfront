"use client";

import { useQuery } from "@tanstack/react-query";
import appointmentsService from "../appointments.service";

export const STAFF_DAY_BOARD_QUERY_KEY = "STAFF_DAY_BOARD_QUERY_KEY";

export const useQueryStaffDayBoard = (
  staffMemberId: number | undefined,
  date: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [STAFF_DAY_BOARD_QUERY_KEY, staffMemberId, date],
    queryFn: () => appointmentsService.getStaffDayBoard(staffMemberId!, date),
    enabled: !!staffMemberId && !!date && (options?.enabled ?? true),
  });
};
