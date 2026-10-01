"use client";

import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import appointmentsService from "../appointments.service";
import { SALON_APPOINTMENTS_QUERY_KEY } from "./useQuerySalonAppointments";
import { BRANCH_DAY_BOARD_QUERY_KEY } from "./useQueryBranchDayBoard";
import { MY_STAFF_APPOINTMENTS_QUERY_KEY } from "./useQueryAppointmentHistory";
import type {
  IAgendaItem,
  IAgendaQuery,
  IAppointmentHistoryItem,
  ISalonAppointmentItem,
} from "../types/appointments.type";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { addDaysYmd } from "@/shared/utils/salonTime";

/** Longest range the stitched (per-day) loader fetches — one week plus a little. */
const MAX_DAYS = 14;

function enumerateDays(from: string, to: string): string[] {
  const days: string[] = [];
  for (let d = from; d <= to && days.length < MAX_DAYS; d = addDaysYmd(d, 1)) {
    days.push(d);
  }
  return days;
}

function fromSalonList(item: ISalonAppointmentItem, customerName: string | null): IAgendaItem {
  const services = (item.services ?? []).map((s) => ({
    name: s.serviceName,
    durationMinutes: s.durationMinutes,
    price: s.price,
  }));
  return {
    numericId: item.numericId,
    publicId: item.publicId ?? null,
    startTime: item.startTime,
    endTime: item.endTime,
    status: item.status,
    customerName,
    services,
    staffNames: item.staffNames ?? null,
    branchName: item.branchName ?? null,
    totalPrice: services.reduce((sum, s) => sum + (s.price || 0), 0),
  };
}

function fromHistory(item: IAppointmentHistoryItem): IAgendaItem {
  return {
    numericId: item.numericId,
    publicId: item.id,
    startTime: item.startTime,
    endTime: item.endTime,
    status: item.status,
    customerName: item.customerName ?? null,
    services: (item.services ?? []).map((s) => ({
      name: s.name,
      staffName: s.staffName,
      durationMinutes: s.durationMinutes,
      price: s.price,
    })),
    staffNames: item.staffNames ?? null,
    branchName: item.branchName ?? null,
    totalPrice: item.totalPrice,
  };
}

const byStart = (a: IAgendaItem, b: IAgendaItem) =>
  new Date(a.startTime).getTime() - new Date(b.startTime).getTime();

/**
 * Appointments of the active salon for `from`…`to` (Tehran days), with customer names.
 *
 * - `mine`: one `staff/me` history request (already has customer names and a date range).
 * - otherwise: the day list per day (all statuses, optional branch/staff) plus each branch's
 *   day-board for the customer name, since the day list doesn't carry it.
 *
 * Query keys reuse the underlying hooks' keys, so lifecycle mutations that invalidate those
 * refresh this too.
 */
export function useQueryAgenda(query: IAgendaQuery, options?: { enabled?: boolean }) {
  const salonId = useSalonContextStore((s) => s.salonId);
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const enabled = !!salonId && (options?.enabled ?? true);
  const days = useMemo(() => enumerateDays(query.from, query.to), [query.from, query.to]);

  const branches = useQuerySalonById(salonPublicId || undefined).data?.data?.branches ?? [];
  const boardBranches = query.branchId
    ? branches.filter((b) => b.branchId === query.branchId)
    : branches;

  const historyQuery = {
    from: query.from,
    to: query.to,
    page: 1,
    pageSize: 100,
  };
  const mine = useQuery({
    queryKey: [MY_STAFF_APPOINTMENTS_QUERY_KEY, salonId, historyQuery],
    queryFn: () => appointmentsService.getMyStaffAppointments(historyQuery),
    enabled: enabled && !!query.mine,
  });

  const listOptions = {
    pageSize: 100,
    branchId: query.branchId,
    staffMemberId: query.staffMemberId,
  };
  const lists = useQueries({
    queries: days.map((date) => ({
      queryKey: [SALON_APPOINTMENTS_QUERY_KEY, salonId, date, listOptions],
      queryFn: () =>
        appointmentsService.getSalonAppointments({
          salonId: salonId ?? undefined,
          date,
          ...listOptions,
        }),
      enabled: enabled && !query.mine,
    })),
  });

  const boards = useQueries({
    queries: days.flatMap((date) =>
      boardBranches.map((branch) => ({
        queryKey: [BRANCH_DAY_BOARD_QUERY_KEY, branch.publicId, date],
        queryFn: () => appointmentsService.getBranchDayBoard(branch.publicId, date),
        enabled: enabled && !query.mine && !!branch.publicId,
      }))
    ),
  });

  const items = useMemo<IAgendaItem[]>(() => {
    if (query.mine) {
      const rows = mine.data?.data?.items ?? [];
      const branchName = query.branchId
        ? branches.find((b) => b.branchId === query.branchId)?.name
        : undefined;
      return rows
        .map(fromHistory)
        .filter((x) => !branchName || x.branchName === branchName)
        .sort(byStart);
    }

    const names = new Map<number, string>();
    for (const board of boards) {
      for (const group of board.data?.data ?? []) {
        for (const row of group.items) {
          if (row.customerName) names.set(row.appointmentId, row.customerName);
        }
      }
    }
    const seen = new Set<number>();
    const out: IAgendaItem[] = [];
    for (const list of lists) {
      for (const row of list.data?.data?.items ?? []) {
        if (seen.has(row.numericId)) continue;
        seen.add(row.numericId);
        out.push(fromSalonList(row, names.get(row.numericId) ?? null));
      }
    }
    return out.sort(byStart);
  }, [query.mine, query.branchId, mine.data, lists, boards, branches]);

  const isLoading = query.mine ? mine.isLoading : lists.some((q) => q.isLoading);
  const isError = query.mine ? mine.isError : lists.some((q) => q.isError);
  // Names arrive a moment after the list; the row shows a placeholder meanwhile.
  const namesLoading = !query.mine && boards.some((q) => q.isLoading);

  return { items, isLoading, isError, namesLoading, days };
}
