import { TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface IStaffProfile {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  staffType?: number;
  avatarUrl?: string | null;
  publicId?: string | null;
}

export type TStaffProfileEntity = TResponse<IStaffProfile[]>;
