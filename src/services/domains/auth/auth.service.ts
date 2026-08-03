import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  ILoginRequest,
  IVerifyOtpRequest,
  ISendOtpRequest,
  ISetPasswordRequest,
  ISetPasswordWithOtpRequest,
  IForgetPasswordRequest,
  IRefreshRequest,
  ILogoutRequest,
  ISwitchContextRequest,
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
    return await axiosInstance.post<unknown, TAuthEntity>(
      API_ADDRESS.AUTH.LOGIN_PASSWORD,
      data
    );
  }

  async setPassword(data: ISetPasswordRequest) {
    return await axiosInstance.post<unknown, void>(
      API_ADDRESS.AUTH.SET_PASSWORD,
      data
    );
  }

  async setPasswordWithOtp(data: ISetPasswordWithOtpRequest) {
    return await axiosInstance.post<unknown, TAuthEntity>(
      API_ADDRESS.AUTH.SET_PASSWORD_WITH_OTP,
      data
    );
  }

  async forgetPassword(data: IForgetPasswordRequest) {
    return await axiosInstance.post<unknown, void>(
      API_ADDRESS.AUTH.FORGET_PASSWORD,
      data
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

  async switchContext(data: ISwitchContextRequest) {
    return await axiosInstance.post<unknown, TAuthEntity>(
      API_ADDRESS.AUTH.SWITCH_CONTEXT,
      data
    );
  }
}

const authService = new AuthService();
export default authService;
