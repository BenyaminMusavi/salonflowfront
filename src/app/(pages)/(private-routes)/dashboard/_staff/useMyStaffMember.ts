"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import appointmentsService from "@/services/domains/appointments/appointments.service";
import { MY_STAFF_APPOINTMENTS_QUERY_KEY } from "@/services/domains/appointments/hooks/useQueryAppointmentHistory";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useQueryCatalogOfferings } from "@/services/domains/catalog/hooks";
import { useQueryStaffForOfferings } from "@/services/domains/staff-profile/hooks/useQueryStaffForOfferings";
import { useQueryAuthMe } from "@/services/domains/auth/hooks/useQueryAuthMe";
import type { IStaffProfile } from "@/services/domains/staff-profile/types/staff-profile.type";

/**
 * The caller's own staff profile in the active salon. No endpoint says "this is me" yet, so:
 * 1. a single-staff appointment from `staff/me` names my staffPublicId;
 * 2. else a unique first-name match with `/api/auth/me`;
 * 3. else `null` — the page falls back to asking the user to pick.
 */
export function useMyStaffMember(): {
  me: IStaffProfile | null;
  staff: IStaffProfile[];
  isLoading: boolean;
} {
  const salonId = useSalonContextStore((s) => s.salonId);
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const firstName = useQueryAuthMe().data?.data?.firstName?.trim() ?? "";

  const offerings = useQueryCatalogOfferings(true).data?.data ?? [];
  const offeringIds = useMemo(() => offerings.map((o) => o.publicId).filter(Boolean), [offerings]);
  const staffQuery = useQueryStaffForOfferings(salonPublicId || salonId || undefined, offeringIds, {
    enabled: offeringIds.length > 0,
  });
  const staff = staffQuery.data?.data ?? [];

  const historyQuery = { page: 1, pageSize: 20 };
  const history = useQuery({
    queryKey: [MY_STAFF_APPOINTMENTS_QUERY_KEY, salonId, historyQuery],
    queryFn: () => appointmentsService.getMyStaffAppointments(historyQuery),
    enabled: salonId != null,
  });

  const me = useMemo(() => {
    for (const item of history.data?.data?.items ?? []) {
      const ids = new Set((item.services ?? []).map((s) => s.staffPublicId).filter(Boolean));
      if (ids.size === 1) {
        const [id] = [...ids];
        const match = staff.find((s) => s.staffPublicId === id);
        if (match) return match;
      }
    }
    if (firstName) {
      const byName = staff.filter((s) => s.firstName?.trim() === firstName);
      if (byName.length === 1) return byName[0];
    }
    return null;
  }, [history.data, staff, firstName]);

  return { me, staff, isLoading: staffQuery.isLoading || history.isLoading };
}
