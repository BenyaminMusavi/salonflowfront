import { TResponse, TPagedResult } from "@/services/common/data-types/SharedDataTypes";
import { PersonGender } from "@/services/common/enums/domain-enums";

export interface ICustomer {
  id: number;
  /** Customer.PublicId (Guid) — for GET /api/appointments/customer/{customerPublicId}. */
  publicId: string;
  fullName: string;
  phone: string;
  email?: string;
  birthDate?: string;
  gender?: PersonGender;
  smsConsent?: boolean;
  ownerStaffId?: number;
}

export type TCustomersEntity = TResponse<TPagedResult<ICustomer>>;
