import { TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface IWorkingSchedule {
  id: number;
  staffMemberId: number;
  dayOfWeek: number;
  startTime?: string | null;
  endTime?: string | null;
  breakStart?: string | null;
  breakEnd?: string | null;
  isOffDay: boolean;
  isManagedBySalon: boolean;
}

export interface IWorkingScheduleRequest {
  staffMemberId: number;
  dayOfWeek: number;
  startTime?: string | null;
  endTime?: string | null;
  breakStart?: string | null;
  breakEnd?: string | null;
  isOffDay: boolean;
  isManagedBySalon?: boolean;
}

export type TWorkingSchedulesEntity = TResponse<IWorkingSchedule[]>;
export type TWorkingScheduleEntity = TResponse<IWorkingSchedule>;

