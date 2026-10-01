import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  TWalletEntity,
  TWalletTransactionsEntity,
} from "./types/wallets.type";

/** The wallet is platform credit: only the customer's own endpoints exist — salons can't read, charge or debit it. */
class WalletsService {
  async getMine() {
    return await axiosInstance.get<unknown, TWalletEntity>(API_ADDRESS.WALLETS.ME);
  }

  async getMyTransactions() {
    return await axiosInstance.get<unknown, TWalletTransactionsEntity>(
      API_ADDRESS.WALLETS.ME_TRANSACTIONS
    );
  }
}

const walletsService = new WalletsService();
export default walletsService;
