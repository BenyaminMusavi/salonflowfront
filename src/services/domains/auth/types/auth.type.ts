import { TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface IAuth {
  accessToken: string;
  refreshToken: string | null;
  hasPassword?: boolean;
}

export interface IAuthMeMembership {
  salonId: number;
  salonPublicId: string;
  salonName: string;
  roleId: number;
  roleName: string;
  branchId: number | null;
}

export interface IAuthMe {
  userId: number;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  memberships: IAuthMeMembership[];
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

export interface ISetPasswordWithOtpRequest {
  phone: string;
  code: string;
  password: string;
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
export type TAuthMeEntity = TResponse<IAuthMe>;
