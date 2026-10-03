import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import type {
  ICustomerListParams,
  IPatchCustomerRequest,
  TCustomerDetailsEntity,
  TCustomersEntity,
} from "./types/customers.type";

class CustomersService {
  async list(params?: ICustomerListParams) {
    return await axiosInstance.get<unknown, TCustomersEntity>(
      API_ADDRESS.CUSTOMERS.BASE,
      {
        params: {
          search: params?.search || undefined,
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 20,
          segment: params?.segment && params.segment !== "all" ? params.segment : undefined,
          sort: params?.sort,
        },
      }
    );
  }

  async getDetails(publicId: string) {
    return await axiosInstance.get<unknown, TCustomerDetailsEntity>(
      API_ADDRESS.CUSTOMERS.BY_PUBLIC_ID(publicId)
    );
  }

  async patch(publicId: string, body: IPatchCustomerRequest) {
    return await axiosInstance.patch<unknown, TCustomerDetailsEntity>(
      API_ADDRESS.CUSTOMERS.BY_PUBLIC_ID(publicId),
      body
    );
  }
}

const customersService = new CustomersService();
export default customersService;
