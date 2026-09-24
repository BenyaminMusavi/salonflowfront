import { TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface IAuth {
  accessToken: string;
  refreshToken: string | null;
  hasPassword?: boolean;
  /** True when the reset-password response requires the user to re-accept terms. */
  requiresTermsReacceptance?: boolean;
  /**
   * True when the JWT carries the global platform `Admin` role. UI-only convenience
   * (show/hide the admin panel entry, post-login redirect) — real enforcement is always
   * server-side via the `AdminOnly` policy, never trust this for anything security-relevant.
   */
  isAdmin?: boolean;
}

export interface IAuthMeMembership {
  salonId: number;
  salonPublicId: string;
  salonName: string;
  roleId: number;
  roleName: string;
  branchId: number | null;
}

export interface IPendingStaffInvitation {
  salonPublicId: string;
  salonName: string;
  staffPublicId: string;
}

export interface IAuthMe {
  userId: number;
  /** Customer public id (Guid) — required as `entityPublicId` for `POST /api/Media/upload/5/{publicId}`. */
  publicId: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  /** Relative media path (e.g. "/uploads/customer/xxx.jpg") set after an entityType=5/usageType=3 (Profile) upload, or null. Resolve with salonImageSrc(). */
  avatarUrl: string | null;
  memberships: IAuthMeMembership[];
  /** Staff invitations (StaffMember.Status == Pending) awaiting this user's accept/reject. */
  pendingStaffInvitations: IPendingStaffInvitation[];
  /** See {@link IAuth.isAdmin} — same UI-only caveat applies. */
  isAdmin?: boolean;
}

export interface ILoginRequest {
  phone: string;
  password: string;
}

export interface IVerifyOtpRequest {
  phone: string;
  code: string;
  /**
   * Required (must be true) only when this verification creates a brand-new account.
   * Ignored for a returning user logging back in. Backend rejects new-account creation
   * with a validation_error (field "acceptedterms") when this is false/omitted.
   */
  acceptedTerms: boolean;
}

export interface ISendOtpRequest {
  phone: string;
}

export interface IForgetPasswordRequest {
  phone: string;
}

export interface ISetPasswordRequest {
  password: string;
  /**
   * Required, and must match the current password, whenever the account already has one
   * set (i.e. any "change password" screen, not the one-time first-password-setup screen
   * right after signup). Wrong/missing value returns a generic 401 authentication_error —
   * the backend does not distinguish this from any other login failure in the message text.
   */
  oldPassword?: string;
  /** Optional — only updates the name if sent. Corrected from required: backend accepts omission. */
  firstName?: string;
  /** Optional — only updates the name if sent. Corrected from required: backend accepts omission. */
  lastName?: string;
}

/** Step 2 of forgot-password: checks the OTP from forget-password and trades it for a reset token. */
export interface IVerifyResetCodeRequest {
  phone: string;
  code: string;
}

export interface IVerifyResetCode {
  /** Single-use, short-lived token; only proves OTP ownership for the reset-password call. */
  resetToken: string;
  /** ISO UTC — after this the user must request a new code. */
  expiresAt: string;
}

/** Step 3 of forgot-password: sets the new password and returns a normal login token pair. */
export interface IResetPasswordRequest {
  resetToken: string;
  newPassword: string;
}

export interface IUpdateProfileRequest {
  firstName: string;
  lastName: string;
}

export interface IRefreshRequest {
  refreshToken: string;
}

export interface ILogoutRequest {
  refreshToken: string;
}

export interface ISwitchContextRequest {
  salonId: number | null;
  branchId: number | null;
  refreshToken: string;
}

export type TAuthEntity = TResponse<IAuth>;
export type TVerifyResetCodeEntity = TResponse<IVerifyResetCode>;
export type TAuthMeEntity = TResponse<IAuthMe>;
