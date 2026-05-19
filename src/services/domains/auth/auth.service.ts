import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  TAuthResponse,
  ILoginRequest,
  IVerifyOtpRequest,
  ISendOtpRequest,
} from "./types/auth.type";

class AuthService {
  async sendOtp(data: ISendOtpRequest) {
    return await axiosInstance.post<unknown, TAuthResponse>(
      API_ADDRESS.AUTH.SEND_OTP,
      data
    );
  }

  async verifyOtp(data: IVerifyOtpRequest) {
    return await axiosInstance.post<unknown, TAuthResponse>(
      API_ADDRESS.AUTH.VERIFY_OTP,
      data
    );
  }

  async loginPassword(data: ILoginRequest) {
    return await axiosInstance.post<unknown, TAuthResponse>(
      API_ADDRESS.AUTH.LOGIN_PASSWORD,
      data
    );
  }

  async refresh(refreshToken: string) {
    return await axiosInstance.post<unknown, TAuthResponse>(
      API_ADDRESS.AUTH.REFRESH,
      { refreshToken }
    );
  }

  async me() {
    return await axiosInstance.get(API_ADDRESS.AUTH.ME);
  }

  async switchContext(salonId?: number, branchId?: number) {
    return await axiosInstance.post<unknown, TAuthResponse>(
      API_ADDRESS.AUTH.SWITCH_CONTEXT,
      { salonId, branchId }
    );
  }
}

const authService = new AuthService();
export default authService;