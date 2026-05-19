import { TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string | null;
}

export type TAuthResponse = TResponse<IAuthResponse>;

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