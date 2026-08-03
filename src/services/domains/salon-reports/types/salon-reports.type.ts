import { TResponse } from "@/services/common/data-types/SharedDataTypes";
import { SalonReportReason } from "@/services/common/enums/domain-enums";

export interface ICreateSalonReportRequest {
  salonId: number;
  reason: SalonReportReason | number;
  description?: string | null;
  appointmentId?: number | null;
}

export interface ISalonReport {
  id: number;
  salonId: number;
  reason: number;
  description?: string | null;
  status?: number;
  createdAt?: string;
}

export type TSalonReportEntity = TResponse<ISalonReport>;
