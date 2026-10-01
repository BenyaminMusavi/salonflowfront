"use client";

import { useMemo } from "react";
import { StaffInvitationStatus } from "@/services/common/enums/domain-enums";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { useQueryStaffRoster } from "@/services/domains/salons/hooks/useQueryStaffRoster";
import { useMutateSalonStaff } from "@/services/domains/salons/hooks/useMutateSalonStaff";
import { useQueryStaffForOfferings } from "@/services/domains/staff-profile/hooks/useQueryStaffForOfferings";
import { useQueryAuthMe } from "@/services/domains/auth/hooks/useQueryAuthMe";
import type {
  IOnboardingStaff,
  IStaffRosterMember,
} from "@/services/domains/salons/types/onboarding.type";

export type StaffState = "owner" | "active" | "pending" | "awaitingLogin" | "rejected";

export interface ISalonStaffMember {
  publicId: string;
  /** Numeric id the schedule / staff-services / quick-book endpoints need. Only known once the
   * person is bookable (has a profile with at least one service). */
  staffMemberId: number | null;
  name: string;
  phone: string | null;
  isCreator: boolean;
  state: StaffState;
  branchPublicId: string;
  branchName: string | null;
  offeringPublicIds: string[];
}

export const STAFF_STATE_LABEL: Record<StaffState, string> = {
  owner: "مالک سالن",
  active: "فعال",
  pending: "در انتظار پذیرش دعوت",
  awaitingLogin: "هنوز وارد صفا نشده",
  rejected: "دعوت را رد کرده",
};

function stateOf(row: IStaffRosterMember): StaffState {
  if (row.isCreator) return "owner";
  if (row.status === StaffInvitationStatus.Rejected) return "rejected";
  if (row.status === StaffInvitationStatus.Pending) return "pending";
  if (!row.hasLoggedIn) return "awaitingLogin";
  return "active";
}

/**
 * The salon's people (owner only — the roster endpoint is owner-only): the invitation roster
 * enriched with display names and numeric ids from the bookable-staff lookup, plus helpers
 * that save the roster back through `save-staff` (the only roster write the backend has).
 */
export function useSalonStaff() {
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const salon = useQuerySalonById(salonPublicId || undefined).data?.data;
  const branches = salon?.branches ?? [];
  const services = salon?.services ?? [];
  const rosterQuery = useQueryStaffRoster(salonPublicId || undefined);
  const roster = rosterQuery.data?.data;
  const ownerPhone = useQueryAuthMe().data?.data?.phone ?? null;

  const offeringIds = useMemo(
    () => services.map((s) => s.offeringPublicId).filter((id): id is string => !!id),
    [services]
  );
  const profiles =
    useQueryStaffForOfferings(salonPublicId || undefined, offeringIds, {
      enabled: offeringIds.length > 0,
    }).data?.data ?? [];

  const members = useMemo<ISalonStaffMember[]>(() => {
    const list = (roster ?? []).map((row) => {
      const profile = profiles.find((p) => p.staffPublicId === row.publicId);
      const phone = row.isCreator ? ownerPhone : row.phoneNumber;
      return {
        publicId: row.publicId,
        staffMemberId: profile?.staffMemberId ?? null,
        name: profile?.firstName || (row.isCreator ? "شما" : phone || "پرسنل"),
        phone,
        isCreator: row.isCreator,
        state: stateOf(row),
        branchPublicId: row.branchPublicId,
        branchName: branches.find((b) => b.publicId === row.branchPublicId)?.name ?? null,
        offeringPublicIds: row.offeringPublicIds ?? [],
      };
    });
    // Owner first, then active people, then pending invitations.
    const order: StaffState[] = ["owner", "active", "awaitingLogin", "pending", "rejected"];
    return list.sort((a, b) => order.indexOf(a.state) - order.indexOf(b.state));
  }, [roster, profiles, branches, ownerPhone]);

  const saveStaff = useMutateSalonStaff();

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
    isLoading: rosterQuery.isLoading,
    isError: rosterQuery.isError,
    saveRoster,
    isSaving: saveStaff.isPending,
  };
}
