import { TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface IAuth {
  accessToken: string;
  refreshToken: string | null;
  hasPassword?: boolean;
}

interface IAuthMe {
  userId: number;
  phone: string;
  firstName: string | null;
  lastName: string | null;
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
  salonId?: number | null;
  branchId?: number | null;
}

export interface ILogoutRequest {
  refreshToken: string;
}

export interface ISwitchContextRequest {
  salonId: number | null;
  branchId: number | null;
}

export type TAuthEntity = TResponse<IAuth>;
export type TAuthMeEntity = TResponse<IAuthMe>;
