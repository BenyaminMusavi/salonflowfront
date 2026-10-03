"use client";

import { useMemo } from "react";
import { useQueryMyStaff } from "@/services/domains/staff/hooks";
import type { IStaffProfile } from "@/services/domains/staff-profile/types/staff-profile.type";

/**
 * The caller's own staff member in the active salon, from `GET /api/staff/me`
 * (`null` when they are not staff here — the endpoint answers 404).
 */
export function useMyStaffMember(): { me: IStaffProfile | null; isLoading: boolean } {
  const query = useQueryMyStaff();
  const data = query.data?.data;
  const me = useMemo<IStaffProfile | null>(
    () =>
      data
        ? { staffMemberId: data.staffMemberId, staffPublicId: data.publicId, firstName: data.fullName }
        : null,
    [data]
  );
  return { me, isLoading: query.isLoading };
}
