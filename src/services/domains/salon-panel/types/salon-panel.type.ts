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
  /**
   * Reference city (`api/locations`). When sent, the district becomes exactly `districtPublicId` (null = none) and the server
   * writes the city's name; when absent on PATCH, the current city/district stay (or `city` text relinks by a unique name).
   */
  cityPublicId?: string | null;
  districtPublicId?: string | null;
  address?: string | null;
  phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  /** PATCH only: true removes the stored coordinates (null latitude/longitude means «unchanged» there). */
  clearCoordinates?: boolean;
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
