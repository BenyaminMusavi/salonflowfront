import { TResponse } from "@/services/common/data-types/SharedDataTypes";
import { GenderType, StaffInvitationStatus } from "@/services/common/enums/domain-enums";

export interface ISaveBasicInfoRequest {
  publicId: string | null;
  name: string;
  description?: string | null;
  instagramHandle?: string | null;
  whatsappNumber?: string | null;
  websiteUrl?: string | null;
}

export interface ISaveBasicInfoResult {
  publicId: string;
}

export interface IOnboardingBranch {
  publicId: string | null;
  name: string;
  city: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  genderType: GenderType;
  phone?: string | null;
}

export interface IOnboardingService {
  publicId: string | null;
  serviceTypePublicId: string;
  basePrice: number;
  durationMinutes: number;
}

export interface IOnboardingStaff {
  publicId: string | null;
  branchPublicId: string;
  isCreator: boolean;
  phoneNumber?: string | null;
  /** ServiceOffering publicIds from save-services; required (≥1) on save-staff. */
  offeringPublicIds: string[];
}

export interface IScheduleDay {
  dayOfWeek: number;
  isOffDay: boolean;
  startTime: string | null;
  endTime: string | null;
}

/** Roster row from GET /api/salons/{salonPublicId}/staff — the server's source of truth. */
export interface IStaffRosterMember {
  publicId: string;
  phoneNumber: string | null;
  isCreator: boolean;
  branchPublicId: string;
  offeringPublicIds: string[];
  /** Computed from User.LastLoginAt != null — not a UI guess. */
  hasLoggedIn: boolean;
  status: StaffInvitationStatus;
}

export type TSaveBasicInfoEntity = TResponse<ISaveBasicInfoResult>;
export type TSaveBranchesEntity = TResponse<IOnboardingBranch[]>;
export type TSaveServicesEntity = TResponse<IOnboardingService[]>;
export type TSaveStaffEntity = TResponse<IOnboardingStaff[]>;
export type TStaffRosterEntity = TResponse<IStaffRosterMember[]>;
