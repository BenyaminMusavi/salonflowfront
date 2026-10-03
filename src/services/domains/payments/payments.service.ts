import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  ICreatePaymentRequest,
  IRefundPaymentRequest,
  TPaymentResultEntity,
  TPaymentsEntity,
  TReceivedPaymentsEntity,
} from "./types/payments.type";

class PaymentsService {
  async create(body: ICreatePaymentRequest) {
    return await axiosInstance.post<unknown, TPaymentResultEntity>(
      API_ADDRESS.PAYMENTS.BASE,
      body
    );
  }

  async refund(body: IRefundPaymentRequest) {
    return await axiosInstance.post<unknown, TPaymentResultEntity>(
      API_ADDRESS.PAYMENTS.REFUND,
      body
    );
  }

  /** Payments received `from`…`to` (Tehran days, ≤ 90 days), newest first. */
  async list(params: { from: string; to: string; method?: number; page?: number; pageSize?: number }) {
    return await axiosInstance.get<unknown, TReceivedPaymentsEntity>(API_ADDRESS.PAYMENTS.BASE, {
      params: { from: params.from, to: params.to, method: params.method, page: params.page ?? 1, pageSize: params.pageSize ?? 20 },
    });
  }

  async getByInvoice(invoiceId: number) {
    return await axiosInstance.get<unknown, TPaymentsEntity>(
      API_ADDRESS.PAYMENTS.BY_INVOICE(invoiceId)
    );
  }
}

const paymentsService = new PaymentsService();
export default paymentsService;

