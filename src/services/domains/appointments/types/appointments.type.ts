import { TResponse } from "@/services/common/data-types/SharedDataTypes";
import { AppointmentStatus } from "@/services/common/enums/domain-enums";

export interface IMyAppointmentListItem {
  id: number;
  startTime: string;
  endTime: string;
  status: AppointmentStatus | number;
  salonName: string;
  staffNames?: string | null;
}

export interface IMyAppointmentService {
  id: number;
  name: string;
  durationMinutes: number;
  price: number;
  staffName?: string | null;
}

export interface IMyAppointmentDetail {
  id: number;
  startTime: string;
  endTime: string;
  status: AppointmentStatus | number;
  salonName: string;
  branchName?: string | null;
  branchAddress?: string | null;
  services: IMyAppointmentService[];
  totalPrice: number;
  totalDurationMinutes: number;
  staffNames?: string | null;
}

export interface ICancelAppointmentRequest {
  reason: string;
}

export type TMyAppointmentsEntity = TResponse<IMyAppointmentListItem[]>;
export type TMyAppointmentDetailEntity = TResponse<IMyAppointmentDetail>;
