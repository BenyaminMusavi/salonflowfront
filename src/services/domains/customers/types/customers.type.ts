import { TResponse } from "@/services/common/data-types/SharedDataTypes";
import { PersonGender } from "@/services/common/enums/domain-enums";

export interface ICustomer {
  id: number;
  fullName: string;
  phone: string;
  email?: string;
  birthDate?: string;
  gender?: PersonGender;
  smsConsent?: boolean;
  ownerStaffId?: number;
}

export type TCustomersEntity = TResponse<ICustomer[]>;
