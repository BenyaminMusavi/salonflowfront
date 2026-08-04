import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  ICreatePaymentRequest,
  IRefundPaymentRequest,
  TPaymentResultEntity,
  TPaymentsEntity,
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

  async getByInvoice(invoiceId: number) {
    return await axiosInstance.get<unknown, TPaymentsEntity>(
      API_ADDRESS.PAYMENTS.BY_INVOICE(invoiceId)
    );
  }
}

const paymentsService = new PaymentsService();
export default paymentsService;

