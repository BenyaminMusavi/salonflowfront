import { IAuthMeMembership } from "@/services/domains/auth/types/auth.type";
import { ISalonMembership } from "@/services/salon-context-store/useSalonContextStore";

export function mapAuthMeMembershipToSalon(
  membership: IAuthMeMembership
): ISalonMembership {
  return {
    salonId: membership.salonId,
    salonPublicId: membership.salonPublicId,
    name: membership.salonName,
    branchId: membership.branchId,
    roleId: membership.roleId,
    roleName: membership.roleName,
  };
}

export function mapAuthMeMembershipsToSalon(
  memberships: IAuthMeMembership[] | null | undefined
): ISalonMembership[] {
  return (memberships ?? []).map(mapAuthMeMembershipToSalon);
}
