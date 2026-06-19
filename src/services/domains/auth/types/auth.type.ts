import { TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string | null;
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

export interface ISetPasswordRequest {
  password: string;
}

export interface ISetPasswordWithOtpRequest {
  phone: string;
  code: string;
  password: string;
}

export type TAuthEntity = TResponse<IAuthResponse>