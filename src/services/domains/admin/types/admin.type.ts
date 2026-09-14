import {
  TPagedResult,
  TResponse,
} from "@/services/common/data-types/SharedDataTypes";
import { SalonApprovalStatus, TrustStatus } from "@/services/common/enums/domain-enums";

export interface IAdminDashboardSummary {
  pendingSalons: number;
  pendingReviews: number;
  pendingReplies: number;
  /** Pending + Investigating salon-misconduct reports. */
  openReports: number;
}

export type TAdminDashboardSummaryEntity = TResponse<IAdminDashboardSummary>;

export interface IAdminSalonListItem {
  publicId: string;
  name: string;
  ownerName: string;
  ownerPhone: string;
  approvalStatus: SalonApprovalStatus;
  trustStatus: TrustStatus;
  rejectionReason: string | null;
  createdAt: string;
}

export interface IAdminSalonBranch {
  name: string;
  city: string;
  address: string;
  phone: string;
}

export interface IAdminSalonPhoto {
  id: number;
  url: string;
  thumbnailUrl: string;
  isHidden: boolean;
}

export interface IAdminSalonDetail extends IAdminSalonListItem {
  description: string | null;
  nationalCode: string | null;
  instagramHandle: string | null;
  whatsappNumber: string | null;
  websiteUrl: string | null;
  branches: IAdminSalonBranch[];
  photos: IAdminSalonPhoto[];
}

export interface IAdminSalonListParams {
  page?: number;
  pageSize?: number;
  approvalStatus?: SalonApprovalStatus;
  trustStatus?: TrustStatus;
  search?: string;
}

export interface IRejectSalonRequest {
  reason: string;
}

/** Shared body shape for suspend and restore — both require a `reason`. */
export interface ISalonReasonRequest {
  reason: string;
}

export type TAdminSalonListEntity = TResponse<TPagedResult<IAdminSalonListItem>>;
export type TAdminSalonDetailEntity = TResponse<IAdminSalonDetail>;
export type TAdminSalonActionEntity = TResponse<IAdminSalonListItem>;
