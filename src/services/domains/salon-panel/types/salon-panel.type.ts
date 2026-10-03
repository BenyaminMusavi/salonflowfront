import type { TResponse } from "@/services/common/data-types/SharedDataTypes";

/** GET /api/salon/profile — the active panel salon's public profile. */
export interface ISalonProfile {
  publicId: string;
  name: string | null;
  username: string | null;
  /** Username changes still allowed after approval. */
  usernameChangesLeft: number;
  description: string | null;
  instagramHandle: string | null;
  whatsappNumber: string | null;
  websiteUrl: string | null;
  approvalStatus: number;
}

/** Only the fields sent are changed; "" clears an optional field. */
export interface IPatchSalonProfileRequest {
  name?: string;
  username?: string;
  description?: string;
  instagramHandle?: string;
  whatsappNumber?: string;
  websiteUrl?: string;
}

export interface IBranchRequest {
  name?: string | null;
  city?: string | null;
  address?: string | null;
  phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  genderType?: number;
  isActive?: boolean;
}

export interface IBranchItem extends IBranchRequest {
  publicId: string | null;
}

export interface IBranchRemovalImpact {
  canRemove: boolean;
  isLastActiveBranch: boolean;
  futureAppointmentsCount: number;
  staffCount: number;
  branchOnlyServicesCount: number;
}

export type TSalonProfileEntity = TResponse<ISalonProfile>;
export type TBranchItemEntity = TResponse<IBranchItem>;
export type TBranchRemovalImpactEntity = TResponse<IBranchRemovalImpact>;
