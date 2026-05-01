import { TResponse } from "@/services/common/data-types/SharedDataTypes";

interface IStaffProfile {
  id: number;
  firstName: string;
  lastName: string;
  fullName?: string;
  avatarUrl?: string;
}

export type TStaffProfileEntity = TResponse<IStaffProfile[]>;
