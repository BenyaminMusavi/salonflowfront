"use client";

import { useQuery } from "@tanstack/react-query";
import appointmentsService from "../appointments.service";

export const BRANCH_DAY_BOARD_QUERY_KEY = "BRANCH_DAY_BOARD_QUERY_KEY";

export const useQueryBranchDayBoard = (
  branchPublicId: string | undefined,
  date: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [BRANCH_DAY_BOARD_QUERY_KEY, branchPublicId, date],
    queryFn: () => appointmentsService.getBranchDayBoard(branchPublicId!, date),
    enabled: !!branchPublicId && !!date && (options?.enabled ?? true),
  });
};
