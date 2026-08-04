import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  IWalletOperationRequest,
  TWalletEntity,
  TWalletTransactionsEntity,
} from "./types/wallets.type";

class WalletsService {
  async getMine() {
    return await axiosInstance.get<unknown, TWalletEntity>(API_ADDRESS.WALLETS.ME);
  }

  async getMyTransactions() {
    return await axiosInstance.get<unknown, TWalletTransactionsEntity>(
      API_ADDRESS.WALLETS.ME_TRANSACTIONS
    );
  }

  async getByCustomer(customerId: number) {
    return await axiosInstance.get<unknown, TWalletEntity>(
      API_ADDRESS.WALLETS.BY_CUSTOMER(customerId)
    );
  }

  async getTransactions(customerId: number) {
    return await axiosInstance.get<unknown, TWalletTransactionsEntity>(
      API_ADDRESS.WALLETS.TRANSACTIONS(customerId)
    );
  }

  async charge(body: IWalletOperationRequest) {
    return await axiosInstance.post<unknown, void>(API_ADDRESS.WALLETS.CHARGE, body);
  }

  async debit(body: IWalletOperationRequest) {
    return await axiosInstance.post<unknown, void>(API_ADDRESS.WALLETS.DEBIT, body);
  }
}

const walletsService = new WalletsService();
export default walletsService;

