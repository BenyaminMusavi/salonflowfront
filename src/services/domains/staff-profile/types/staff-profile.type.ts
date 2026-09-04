import { TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface IStaffProfile {
  /** Required for services[].staffId (long) in quick-book / payout / board filters — the endpoint has no Guid overload for those yet. */
  staffMemberId: number;
  staffPublicId?: string | null;
  firstName?: string | null;
  avatarUrl?: string | null;
}

export type TStaffProfileEntity = TResponse<IStaffProfile[]>;
