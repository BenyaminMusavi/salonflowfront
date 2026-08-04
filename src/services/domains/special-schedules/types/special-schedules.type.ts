import { TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface ISpecialSchedule {
  id: number;
  staffMemberId: number;
  date: string;
  isOffDay: boolean;
  startTime?: string | null;
  endTime?: string | null;
  note?: string | null;
}

export interface ISpecialScheduleRequest {
  staffMemberId: number;
  date: string;
  isOffDay: boolean;
  startTime?: string | null;
  endTime?: string | null;
  note?: string | null;
}

export type TSpecialSchedulesEntity = TResponse<ISpecialSchedule[]>;
export type TSpecialScheduleEntity = TResponse<ISpecialSchedule>;

