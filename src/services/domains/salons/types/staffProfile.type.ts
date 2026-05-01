import { TResponse } from "@/services/common/data-types/SharedDataTypes";

interface IStaffProfile {
  id: number;
  fullName: string;
  avatarUrl?: string;
  role?: string;
}

export type TStaffEntity = TResponse<IStaffProfile[]>;