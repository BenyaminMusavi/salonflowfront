import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  ICreatePayoutRequest,
  TEarningsEntity,
  TPayoutEntity,
  TPayoutsEntity,
} from "./types/payouts.type";

class PayoutsService {
  async getEarnings(params?: {
    staffMemberId?: number;
    status?: number;
    page?: number;
    pageSize?: number;
  }) {
    return await axiosInstance.get<unknown, TEarningsEntity>(API_ADDRESS.EARNINGS.BASE, {
      params: {
        staffMemberId: params?.staffMemberId,
        status: params?.status,
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
      },
    });
  }

  async approveEarning(id: number) {
    return await axiosInstance.post<unknown, void>(API_ADDRESS.EARNINGS.APPROVE(id));
  }

  async createPayout(body: ICreatePayoutRequest) {
    return await axiosInstance.post<unknown, TPayoutEntity>(API_ADDRESS.PAYOUTS.BASE, body);
  }

  async getPayoutById(id: number) {
    return await axiosInstance.get<unknown, TPayoutEntity>(API_ADDRESS.PAYOUTS.BY_ID(id));
  }

  async getPayoutsByStaff(staffMemberId: number) {
    return await axiosInstance.get<unknown, TPayoutsEntity>(
      API_ADDRESS.PAYOUTS.BY_STAFF(staffMemberId)
    );
  }

  async approvePayout(id: number) {
    return await axiosInstance.post<unknown, void>(API_ADDRESS.PAYOUTS.APPROVE(id));
  }

  async markPayoutPaid(id: number, method: number) {
    return await axiosInstance.post<unknown, void>(API_ADDRESS.PAYOUTS.MARK_PAID(id), {
      method,
    });
  }
}

const payoutsService = new PayoutsService();
export default payoutsService;

