import { TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface ICustomer {
  id: number;
  fullName: string;
  phone: string;
}

export type TCustomersEntity = TResponse<ICustomer[]>;

