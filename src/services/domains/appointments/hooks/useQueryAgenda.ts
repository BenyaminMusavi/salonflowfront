"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import appointmentsService from "../appointments.service";
import type {
  IAgendaItem,
  IAgendaItemDto,
  IAgendaQuery,
  IAppointmentHistoryItem,
} from "../types/appointments.type";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { addDaysYmd } from "@/shared/utils/salonTime";

export const AGENDA_QUERY_KEY = "AGENDA_QUERY_KEY";

/** The agenda endpoint returns at most two weeks. */
const MAX_DAYS = 14;

function enumerateDays(from: string, to: string): string[] {
  const days: string[] = [];
  for (let d = from; d <= to && days.length < MAX_DAYS; d = addDaysYmd(d, 1)) days.push(d);
  return days;
}

const staffNamesOf = (services: { staffName?: string | null }[]) =>
  Array.from(new Set(services.map((s) => s.staffName).filter(Boolean))).join("، ") || null;

/** Server agenda row → the item every panel list renders. */
export function agendaDtoToItem(dto: IAgendaItemDto): IAgendaItem {
  const services = (dto.services ?? []).map((s) => ({
    name: s.name ?? "",
    staffName: s.staffName,
    staffPublicId: s.staffPublicId,
    durationMinutes: s.durationMinutes,
    price: s.price,
  }));
  return {
    numericId: dto.numericId,
    publicId: dto.publicId,
    startTime: dto.startTime,
    endTime: dto.endTime,
    status: dto.status,
    customerName: dto.customer?.fullName ?? null,
    customerPublicId: dto.customer?.publicId ?? null,
    customerPhone: dto.customer?.phone ?? null,
    isNewCustomer: dto.customer?.isNew ?? false,
    services,
    staffNames: staffNamesOf(services),
    branchName: dto.branch?.name ?? null,
    totalPrice: dto.totalPrice,
    paymentStatus: dto.paymentStatus,
    outstanding: dto.outstanding,
    hasNote: dto.hasNote,
  };
}

/** A history row (`staff/me`, `customer/{id}`, `staff/{id}`) as an agenda item. */
export function historyToAgendaItem(item: IAppointmentHistoryItem): IAgendaItem {
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
      staffPublicId: s.staffPublicId,
      durationMinutes: s.durationMinutes,
      price: s.price,
    })),
    staffNames: item.staffNames ?? null,
    branchName: item.branchName ?? null,
    totalPrice: item.totalPrice,
  };
}

/**
 * Appointments of the active salon for `from`…`to` (Tehran days) from the single agenda
 * endpoint: customer, services, staff, branch and payment status per row.
 */
export function useQueryAgenda(query: IAgendaQuery, options?: { enabled?: boolean }) {
  const salonId = useSalonContextStore((s) => s.salonId);
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const days = useMemo(() => enumerateDays(query.from, query.to), [query.from, query.to]);
  const branches = useQuerySalonById(salonPublicId || undefined).data?.data?.branches ?? [];
  const branchPublicId =
    query.branchPublicId ?? branches.find((b) => b.branchId === query.branchId)?.publicId;
  const to = days[days.length - 1] ?? query.to;

  const params = {
    from: query.from,
    to,
    mine: query.mine || undefined,
    staffPublicId: query.staffPublicId,
    branchPublicId,
  };
  const agenda = useQuery({
    queryKey: [AGENDA_QUERY_KEY, salonId, params],
    queryFn: () => appointmentsService.getAgenda(params),
    enabled: !!salonId && (options?.enabled ?? true) && (query.branchId == null || !!branchPublicId),
  });

  const items = useMemo(
    () => (agenda.data?.data?.days ?? []).flatMap((d) => d.items.map(agendaDtoToItem)),
    [agenda.data]
  );

  return {
    items,
    isLoading: agenda.isLoading,
    isError: agenda.isError,
    /** Names come with the rows now; kept for callers that showed a placeholder. */
    namesLoading: false,
    days,
  };
}
