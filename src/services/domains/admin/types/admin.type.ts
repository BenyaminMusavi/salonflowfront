import {
  TPagedResult,
  TResponse,
} from "@/services/common/data-types/SharedDataTypes";
import { SalonApprovalStatus, TrustStatus } from "@/services/common/enums/domain-enums";

export interface IAdminDashboardSummary {
  pendingSalons: number;
  pendingReviews: number;
  pendingReplies: number;
  /** Pending + Investigating salon-misconduct reports. */
  openReports: number;
}

export type TAdminDashboardSummaryEntity = TResponse<IAdminDashboardSummary>;

export interface IAdminSalonListItem {
  publicId: string;
  name: string;
  ownerName: string;
  ownerPhone: string;
  approvalStatus: SalonApprovalStatus;
  trustStatus: TrustStatus;
  rejectionReason: string | null;
  createdAt: string;
}

export interface IAdminSalonBranch {
  name: string;
  city: string;
  address: string;
  phone: string;
}

export interface IAdminSalonPhoto {
  id: number;
  url: string;
  thumbnailUrl: string;
  isHidden: boolean;
}

export interface IAdminSalonDetail extends IAdminSalonListItem {
  description: string | null;
  nationalCode: string | null;
  instagramHandle: string | null;
  whatsappNumber: string | null;
  websiteUrl: string | null;
  branches: IAdminSalonBranch[];
  photos: IAdminSalonPhoto[];
}

export interface IAdminSalonListParams {
  page?: number;
  pageSize?: number;
  approvalStatus?: SalonApprovalStatus;
  trustStatus?: TrustStatus;
  search?: string;
}

export interface IRejectSalonRequest {
  reason: string;
}

/** Shared body shape for suspend and restore — both require a `reason`. */
export interface ISalonReasonRequest {
  reason: string;
}

export type TAdminSalonListEntity = TResponse<TPagedResult<IAdminSalonListItem>>;
export type TAdminSalonDetailEntity = TResponse<IAdminSalonDetail>;
export type TAdminSalonActionEntity = TResponse<IAdminSalonListItem>;

export interface IAdminMediaVisibilityRequest {
  reason: string;
}

export interface IAdminMediaActionResult {
  id: number;
  publicId: string;
  salonId: number;
  isHidden: boolean;
}

export type TAdminMediaActionEntity = TResponse<IAdminMediaActionResult>;

/** Global (platform-wide) role names — distinct from per-salon membership roles. */
export type TGlobalRoleName =
  | "Customer"
  | "Staff"
  | "SalonOwner"
  | "Admin"
  | "ChairTenant";

export interface IAdminUserListItem {
  publicId: string;
  firstName: string | null;
  lastName: string | null;
  phone: string;
  /** NOT "blocked" — means the user hasn't verified their phone via OTP yet. Use `isBlocked` for moderation state. */
  isActive: boolean;
  isBlocked: boolean;
  roles: string[];
}

export interface IAdminUserMembership {
  salonPublicId: string;
  salonName: string;
  roleName: string;
  isActive: boolean;
}

export interface IAdminUserDetail extends IAdminUserListItem {
  blockedAt: string | null;
  blockReason: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  globalRoles: string[];
  memberships: IAdminUserMembership[];
}

export interface IAdminUsersParams {
  page?: number;
  pageSize?: number;
  role?: TGlobalRoleName;
  search?: string;
}

export interface IBlockUserRequest {
  reason: string;
}

export type TAdminUsersEntity = TResponse<TPagedResult<IAdminUserListItem>>;
export type TAdminUserDetailEntity = TResponse<IAdminUserDetail>;

export interface IAdminPlatformReportDateParams {
  /** YYYY-MM-DD */
  from?: string;
  /** YYYY-MM-DD */
  to?: string;
}

export interface IAdminPromoPerformanceRow {
  code: string;
  usageCount: number;
  revenue: number;
}

export interface IAdminPromoPerformance {
  items: IAdminPromoPerformanceRow[];
}

export interface IAdminReferralStatusBreakdown {
  status: string;
  count: number;
}

export interface IAdminReferralPerformance {
  byStatus: IAdminReferralStatusBreakdown[];
  totalRewardDaysGranted: number;
  inviteeRevenueGenerated: number;
}

export type TAdminPromoPerformanceEntity = TResponse<IAdminPromoPerformance>;
export type TAdminReferralPerformanceEntity = TResponse<IAdminReferralPerformance>;

export type TAdminPlatformReportName = "promo-performance" | "referral-performance";

/* ---------- Appointment no-show correction (admin, backend AdminAppointmentsController) ---------- */

/**
 * `automatic`: the row carries the no-show stamp, the lines to reopen are fixed by the server.
 * `explicitLinesRequired`: legacy row without a stamp — the admin must name the lines (nothing is guessed).
 * `notNoShow`: the appointment is not in the no-show state.
 */
export type TNoShowReviewResolution = "automatic" | "explicitLinesRequired" | "notNoShow" | (string & {});

export interface IAdminNoShowReviewLine {
  servicePublicId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  price: number;
  /** AppointmentServiceStatus: 1 Scheduled, 2 InProgress, 3 Completed, 4 Cancelled. */
  status: number;
  cancelledAt?: string | null;
  createdAt?: string | null;
  /** Stamped rows only: this line is reopened by the correction. */
  reopensAutomatically: boolean;
}

export interface IAdminNoShowReviewPayment {
  paymentPublicId: string;
  amount: number;
  forfeited: number;
  refunded: number;
  held: number;
}

export interface IAdminNoShowReview {
  appointmentPublicId: string;
  salonId: number;
  status: number;
  startTime: string;
  checkedInBefore: boolean;
  resolution: TNoShowReviewResolution;
  noShowRecordedAt?: string | null;
  noShowHistoryAt?: string | null;
  noShowByUserId?: number | null;
  ownerCanUndo: boolean;
  /** Two cancelled lines overlap in time — the appointment was edited more than once, so picking lines is ambiguous. */
  cancelledLinesOverlap: boolean;
  lines: IAdminNoShowReviewLine[];
  depositPayments: IAdminNoShowReviewPayment[];
}

export interface IRevertNoShowRequest {
  reason: string;
  /** Required for `explicitLinesRequired`; rejected by the server for stamped (`automatic`) rows. */
  servicePublicIds?: string[] | null;
}

export type TAdminNoShowReviewEntity = TResponse<IAdminNoShowReview>;
