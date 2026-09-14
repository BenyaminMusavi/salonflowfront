import { TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface IAdminDashboardSummary {
  pendingSalons: number;
  pendingReviews: number;
  pendingReplies: number;
  /** Pending + Investigating salon-misconduct reports. */
  openReports: number;
}

export type TAdminDashboardSummaryEntity = TResponse<IAdminDashboardSummary>;
