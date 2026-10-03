"use client";

import { useMemo } from "react";
import { StaffInvitationStatus } from "@/services/common/enums/domain-enums";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { useQueryStaffRoster } from "@/services/domains/salons/hooks/useQueryStaffRoster";
import { useMutateSalonStaff } from "@/services/domains/salons/hooks/useMutateSalonStaff";
import { useMutateStaff, useQueryStaffList } from "@/services/domains/staff/hooks";
import type { IStaffListItem, ITimeRange } from "@/services/domains/staff/types/staff.type";
import type { IOnboardingStaff } from "@/services/domains/salons/types/onboarding.type";

export type StaffState = "owner" | "active" | "pending" | "awaitingLogin" | "rejected";

export interface ISalonStaffMember {
  publicId: string;
  /** Numeric id the schedule / staff-services / quick-book endpoints need (known from the invite on). */
  staffMemberId: number | null;
  name: string;
  phone: string | null;
  isCreator: boolean;
  state: StaffState;
  branchPublicId: string;
  branchName: string | null;
  offeringPublicIds: string[];
  servicesCount: number;
  color: string | null;
  today: { isOff: boolean; ranges: ITimeRange[]; appointmentsCount: number } | null;
}

export const STAFF_STATE_LABEL: Record<StaffState, string> = {
  owner: "مالک سالن",
  active: "فعال",
  pending: "در انتظار پذیرش دعوت",
  awaitingLogin: "هنوز وارد صفا نشده",
  rejected: "دعوت را رد کرده",
};

function stateOf(row: IStaffListItem): StaffState {
  if (row.isOwner) return "owner";
  if (row.invitationStatus === StaffInvitationStatus.Rejected) return "rejected";
  if (row.invitationStatus === StaffInvitationStatus.Pending) return "pending";
  if (!row.hasLoggedIn) return "awaitingLogin";
  return "active";
}

/**
 * The salon's people (owner only): `GET /api/staff` (names, ids, branch, invitation state, today's
 * hours) plus each person's offering ids from the onboarding roster. Writes go through the staff
 * endpoints (`staff` = invite / update / remove / resend); `saveRoster` stays only for the
 * roster's offering list.
 */
export function useSalonStaff() {
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const salon = useQuerySalonById(salonPublicId || undefined).data?.data;
  const branches = salon?.branches ?? [];
  const services = salon?.services ?? [];
  const listQuery = useQueryStaffList();
  const list = listQuery.data?.data;
  const rosterQuery = useQueryStaffRoster(salonPublicId || undefined);
  const roster = rosterQuery.data?.data;

  const members = useMemo<ISalonStaffMember[]>(() => {
    const rows = (list ?? []).map((row) => {
      const rosterRow = roster?.find((r) => r.publicId === row.publicId);
      const branchPublicId = row.branch?.publicId ?? rosterRow?.branchPublicId ?? "";
      return {
        publicId: row.publicId,
        staffMemberId: row.staffMemberId || null,
        name: row.fullName?.trim() || (row.isOwner ? "شما" : row.phone || "پرسنل"),
        phone: row.phone,
        isCreator: row.isOwner,
        state: stateOf(row),
        branchPublicId,
        branchName: row.branch?.name ?? branches.find((b) => b.publicId === branchPublicId)?.name ?? null,
        offeringPublicIds: rosterRow?.offeringPublicIds ?? [],
        servicesCount: row.servicesCount,
        color: row.color,
        today: row.today,
      };
    });
    // Owner first, then active people, then pending invitations.
    const order: StaffState[] = ["owner", "active", "awaitingLogin", "pending", "rejected"];
    return rows.sort((a, b) => order.indexOf(a.state) - order.indexOf(b.state));
  }, [list, roster, branches]);

  const saveStaff = useMutateSalonStaff();
  const staff = useMutateStaff();

  /** Writes the whole roster back, applying `change` to the rows first. */
  const saveRoster = (change: (rows: IOnboardingStaff[]) => IOnboardingStaff[]) => {
    const rows: IOnboardingStaff[] = (roster ?? []).map((r) => ({
      publicId: r.publicId,
      branchPublicId: r.branchPublicId,
      isCreator: r.isCreator,
      // Owner identity is JWT-linked server-side, not sent.
      phoneNumber: r.isCreator ? null : r.phoneNumber,
      offeringPublicIds: r.offeringPublicIds ?? [],
    }));
    return saveStaff.mutateAsync({ salonPublicId: salonPublicId!, staff: change(rows) });
  };

  return {
    members,
    branches,
    services,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    saveRoster,
    staff,
    isSaving:
      saveStaff.isPending || staff.invite.isPending || staff.update.isPending || staff.remove.isPending,
  };
}
