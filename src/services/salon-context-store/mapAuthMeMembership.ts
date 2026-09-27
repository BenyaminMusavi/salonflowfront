import { IAuthMeMembership } from "@/services/domains/auth/types/auth.type";
import { ISalonMembership } from "@/services/salon-context-store/useSalonContextStore";
import { SalonRoleName } from "@/services/common/enums/domain-enums";

export function mapAuthMeMembershipToSalon(
  membership: IAuthMeMembership
): ISalonMembership {
  return {
    salonId: membership.salonId,
    salonPublicId: membership.salonPublicId,
    name: membership.salonName,
    branchId: membership.branchId,
    branchPublicId: membership.branchPublicId ?? null,
    roleId: membership.roleId,
    roleName: membership.roleName,
  };
}

/**
 * One entry per salon (`/me` can list a salon twice, e.g. SalonOwner + Staff).
 * The owner row wins for the role; a salon-wide row (no branch) wins for the branch,
 * so `X-Branch-Id` is only sent for a purely branch-scoped membership.
 */
export function mapAuthMeMembershipsToSalon(
  memberships: IAuthMeMembership[] | null | undefined
): ISalonMembership[] {
  const bySalon = new Map<string, ISalonMembership>();
  for (const row of (memberships ?? []).map(mapAuthMeMembershipToSalon)) {
    const key = row.salonPublicId ?? String(row.salonId);
    const existing = bySalon.get(key);
    if (!existing) {
      bySalon.set(key, row);
      continue;
    }
    const owner = [existing, row].find((m) => m.roleName === SalonRoleName.SalonOwner);
    const salonWide = [existing, row].find((m) => !m.branchPublicId);
    bySalon.set(key, {
      ...existing,
      roleId: (owner ?? existing).roleId,
      roleName: (owner ?? existing).roleName,
      branchId: (salonWide ?? existing).branchId,
      branchPublicId: (salonWide ?? existing).branchPublicId,
    });
  }
  return [...bySalon.values()];
}
