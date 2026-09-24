"use client";

import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { SalonRoleName } from "@/services/common/enums/domain-enums";

/** True when the active salon membership is `Staff` (not `SalonOwner`) — same rule as DashboardLayoutClient. */
export function useIsSalonStaff(): boolean {
  return useSalonContextStore(
    (s) =>
      s.memberships.find((m) => m.salonId === s.salonId)?.roleName ===
      SalonRoleName.Staff
  );
}
