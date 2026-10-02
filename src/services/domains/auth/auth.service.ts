import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import type { TResponse } from "@/services/common/data-types/SharedDataTypes";
import type { ISalonCapabilities } from "./types/auth.type";
import {
  ILoginRequest,
  IVerifyOtpRequest,
  ISendOtpRequest,
  ISetPasswordRequest,
  IResetPasswordRequest,
  IVerifyResetCodeRequest,
  TVerifyResetCodeEntity,
  IUpdateProfileRequest,
  IForgetPasswordRequest,
  IRefreshRequest,
  ILogoutRequest,
  TAuthEntity,
  TAuthMeEntity,
} from "./types/auth.type";

class AuthService {
  async sendOtp(data: ISendOtpRequest) {
    return await axiosInstance.post<unknown, TAuthEntity>(
      API_ADDRESS.AUTH.SEND_OTP,
      data
    );
  }

  async verifyOtp(data: IVerifyOtpRequest) {
    return await axiosInstance.post<unknown, TAuthEntity>(
      API_ADDRESS.AUTH.VERIFY_OTP,
      data
    );
  }

  async loginWithPassword(data: ILoginRequest) {
    // A 401 here means wrong credentials; also used right after a password change,
    // when the old tokens are already revoked — never refresh-and-retry.
    return await axiosInstance.post<unknown, TAuthEntity>(
      API_ADDRESS.AUTH.LOGIN_PASSWORD,
      data,
      { skipAuthRetry: true }
    );
  }

  async setPassword(data: ISetPasswordRequest) {
    // A 401 here always means "oldPassword missing/incorrect", never "session expired"
    // (BACKEND_UPDATE_REPORT.md §1.1/§2.1) — skip the refresh-and-retry flow entirely.
    return await axiosInstance.post<unknown, void>(
      API_ADDRESS.AUTH.SET_PASSWORD,
      data,
      { skipAuthRetry: true }
    );
  }

  async forgetPassword(data: IForgetPasswordRequest) {
    // Anonymous forgot-password step: never refresh-and-retry or log out on 401.
    return await axiosInstance.post<unknown, void>(
      API_ADDRESS.AUTH.FORGET_PASSWORD,
      data,
      { skipAuthRetry: true }
    );
  }

  async verifyResetCode(data: IVerifyResetCodeRequest) {
    // A 401 here means "wrong/expired code", never "session expired" — don't refresh-and-retry.
    return await axiosInstance.post<unknown, TVerifyResetCodeEntity>(
      API_ADDRESS.AUTH.VERIFY_RESET_CODE,
      data,
      { skipAuthRetry: true }
    );
  }

  async resetPassword(data: IResetPasswordRequest) {
    // A 401 here means "reset token invalid/expired", not a stale session.
    return await axiosInstance.post<unknown, TAuthEntity>(
      API_ADDRESS.AUTH.RESET_PASSWORD,
      data,
      { skipAuthRetry: true }
    );
  }

  async refresh(data: IRefreshRequest) {
    return await axiosInstance.post<unknown, TAuthEntity>(
      API_ADDRESS.AUTH.REFRESH,
      data
    );
  }

  async logout(data: ILogoutRequest) {
    return await axiosInstance.post<unknown, void>(
      API_ADDRESS.AUTH.LOGOUT,
      data
    );
  }

  async me() {
    return await axiosInstance.get<unknown, TAuthMeEntity>(API_ADDRESS.AUTH.ME);
  }

  /** Role abilities in the active panel salon. */
  async capabilities() {
    return await axiosInstance.get<unknown, TResponse<ISalonCapabilities>>(API_ADDRESS.AUTH.CAPABILITIES);
  }

  async updateProfile(data: IUpdateProfileRequest) {
    return await axiosInstance.patch<unknown, TAuthMeEntity>(
      API_ADDRESS.AUTH.PROFILE,
      data
    );
  }
}

const authService = new AuthService();
export default authService;
