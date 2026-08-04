import { TPagedResult, TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface IInvoiceItem {
  id: number;
  description?: string | null;
  quantity?: number;
  unitPrice?: number;
  total?: number;
}

export interface IInvoice {
  id: number;
  status?: number;
  customerId?: number;
  appointmentId?: number;
  totalAmount?: number;
  outstandingAmount?: number;
  items?: IInvoiceItem[];
}

export interface ICreateInvoiceItemRequest {
  description: string;
  quantity: number;
  unitPrice: number;
}

export type TInvoicesEntity = TResponse<TPagedResult<IInvoice>>;
export type TInvoiceEntity = TResponse<IInvoice>;

