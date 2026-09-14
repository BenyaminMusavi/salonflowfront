import { TPagedResult, TResponse } from "@/services/common/data-types/SharedDataTypes";
import { SalonReportReason, SalonReportStatus } from "@/services/common/enums/domain-enums";

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

/** Admin moderation queue item — `GET /api/salon-reports/pending`. */
export interface IAdminSalonReportListItem {
  id: number;
  reason: SalonReportReason;
  status: SalonReportStatus;
  description: string | null;
  customerId: number;
  customerName: string;
  salonId: number;
  salonName: string;
}

export interface IAdminSalonReportsParams {
  page?: number;
  pageSize?: number;
}

export interface IAdminSalonReportNotesRequest {
  adminNotes?: string;
}

export type TAdminSalonReportsEntity = TResponse<TPagedResult<IAdminSalonReportListItem>>;
