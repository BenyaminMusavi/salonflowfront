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
}

export interface ISendOtpRequest {
  phone: string;
}

export interface IForgetPasswordRequest {
  phone: string;
}

export interface ISetPasswordRequest {
  password: string;
  firstName: string;
  lastName: string;
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
