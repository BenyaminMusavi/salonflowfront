import { TResponse } from "@/services/common/data-types/SharedDataTypes";
import { GenderType, StaffInvitationStatus } from "@/services/common/enums/domain-enums";

export interface ISaveBasicInfoRequest {
  publicId: string | null;
  name: string;
  /** Public-link username — required on create; on edit, null/empty keeps the current one. */
  username?: string | null;
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
  /** false blocks NEW bookings against this branch; existing appointments are untouched. */
  isActive: boolean;
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

/** One row from GET /api/salons/{salonPublicId}/onboarding-draft's `schedule` — the caller's own
 * WorkingSchedule. Same "HH:mm:ss" string shape the onboarding wizard already saves. */
export interface IOnboardingScheduleDay {
  dayOfWeek: number;
  isOffDay: boolean;
  startTime: string | null;
  endTime: string | null;
}

/** Full server-side state of a salon still in progress (Draft/Rejected/Pending/Approved) — used to
 * rehydrate the onboarding wizard when the local (localStorage) draft is empty or stale, e.g. on a
 * different device/browser than the one onboarding was started on. */
export interface ISalonOnboardingDraft {
  publicId: string;
  approvalStatus: number;
  name: string;
  username: string | null;
  description: string | null;
  instagramHandle: string | null;
  whatsappNumber: string | null;
  websiteUrl: string | null;
  branches: IOnboardingBranch[];
  services: IOnboardingService[];
  /** Empty when the owner never saved a schedule yet — caller should keep its own default in that case. */
  schedule: IOnboardingScheduleDay[];
}

/** GET /api/salons/username-availability — `username` is the normalized value that would be saved. */
export interface IUsernameAvailability {
  username: string;
  available: boolean;
  reason: "invalid" | "reserved" | "taken" | null;
}

export type TSaveBasicInfoEntity = TResponse<ISaveBasicInfoResult>;
export type TUsernameAvailabilityEntity = TResponse<IUsernameAvailability>;
export type TSaveBranchesEntity = TResponse<IOnboardingBranch[]>;
export type TSaveServicesEntity = TResponse<IOnboardingService[]>;
export type TSaveStaffEntity = TResponse<IOnboardingStaff[]>;
export type TStaffRosterEntity = TResponse<IStaffRosterMember[]>;
export type TSalonOnboardingDraftEntity = TResponse<ISalonOnboardingDraft>;
