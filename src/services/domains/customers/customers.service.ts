import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import { TCustomersEntity } from "./types/customers.type";

class CustomersService {
  async list(params?: { search?: string; page?: number; pageSize?: number }) {
    return await axiosInstance.get<unknown, TCustomersEntity>(
      API_ADDRESS.CUSTOMERS.BASE,
      {
        params: {
          search: params?.search,
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 20,
        },
      }
    );
  }
}

const customersService = new CustomersService();
export default customersService;

