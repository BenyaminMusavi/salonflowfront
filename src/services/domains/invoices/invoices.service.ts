import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  ICreateInvoiceItemRequest,
  TInvoiceEntity,
  TInvoicesEntity,
} from "./types/invoices.type";

class InvoicesService {
  async list(params?: { status?: number; page?: number; pageSize?: number }) {
    return await axiosInstance.get<unknown, TInvoicesEntity>(API_ADDRESS.INVOICES.BASE, {
      params: {
        status: params?.status,
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
      },
    });
  }

  async getById(id: number) {
    return await axiosInstance.get<unknown, TInvoiceEntity>(
      API_ADDRESS.INVOICES.BY_ID(id)
    );
  }

  async createFromAppointment(appointmentId: number) {
    return await axiosInstance.post<unknown, TInvoiceEntity>(
      API_ADDRESS.INVOICES.FROM_APPOINTMENT(appointmentId)
    );
  }

  async addItem(id: number, body: ICreateInvoiceItemRequest) {
    return await axiosInstance.post<unknown, TInvoiceEntity>(
      API_ADDRESS.INVOICES.ADD_ITEM(id),
      body
    );
  }

  async deleteItem(id: number, itemId: number) {
    return await axiosInstance.delete<unknown, void>(
      API_ADDRESS.INVOICES.DELETE_ITEM(id, itemId)
    );
  }

  async cancel(id: number) {
    return await axiosInstance.post<unknown, void>(API_ADDRESS.INVOICES.CANCEL(id));
  }
}

const invoicesService = new InvoicesService();
export default invoicesService;

