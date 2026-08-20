import { TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface IZReportStaffCommission {
  staffMemberId: number;
  staffName: string;
  commissionTotal: number;
}

export interface IZReport {
  date: string;
  salonId: number;
  cashTotal: number;
  cardTotal: number;
  onlineTotal: number;
  paymentsTotal: number;
  transferTotal?: number;
  walletTotal?: number;
  collectedTotal?: number;
  tipsTotal: number;
  staffCommissionTotal: number;
  staffCommissions?: IZReportStaffCommission[];
}

export type TZReportEntity = TResponse<IZReport>;

export interface IReportRangeParams {
  from: string;
  to: string;
  branchId?: number;
}

export interface IReportSparklinePoint {
  date: string;
  collected: number;
  appointments: number;
}

export interface IDashboardSummary {
  from?: string;
  to?: string;
  previousFrom?: string;
  previousTo?: string;
  branchId?: number | null;
  collected?: number;
  collectedPercentChange?: number | null;
  tillCollected?: number;
  tillCollectedPercentChange?: number | null;
  serviceRevenue?: number;
  serviceRevenuePercentChange?: number | null;
  netCollected?: number;
  netCollectedPercentChange?: number | null;
  outstanding?: number;
  outstandingPercentChange?: number | null;
  cancelRate?: number;
  cancelRatePercentChange?: number | null;
  noShowRate?: number;
  noShowRatePercentChange?: number | null;
  newCustomers?: number;
  newCustomersPercentChange?: number | null;
  returningCustomers?: number;
  returningCustomersPercentChange?: number | null;
  sparkline?: IReportSparklinePoint[];
  financial?: Record<string, unknown>;
  operational?: Record<string, unknown>;
  customers?: Record<string, unknown>;
}

export type TDashboardSummaryEntity = TResponse<IDashboardSummary>;

export interface IRevenueByMethodRow {
  paymentMethod?: number;
  paymentType?: number;
  methodName?: string;
  amount?: number;
  collected?: number;
  refunds?: number;
}

export interface IRevenueByServiceRow {
  offeringId?: number;
  serviceName?: string;
  name?: string;
  amount?: number;
  collected?: number;
  count?: number;
}

export interface IRevenueByBranchRow {
  branchId?: number;
  branchName?: string;
  name?: string;
  amount?: number;
  collected?: number;
}

export interface IRevenueByDayRow {
  date: string;
  collected?: number;
  amount?: number;
  appointments?: number;
}

export interface IOutstandingReport {
  outstanding?: number;
  depositsInFlight?: number;
  depositInProgress?: number;
  discounts?: number;
  tax?: number;
  taxTotal?: number;
}

export interface IFunnelCountRow {
  status?: number;
  source?: number;
  name?: string;
  count?: number;
}

export interface IAppointmentFunnel {
  byStatus?: IFunnelCountRow[];
  bySource?: IFunnelCountRow[];
  statuses?: IFunnelCountRow[];
  sources?: IFunnelCountRow[];
}

export interface IStaffPerformanceRow {
  staffMemberId?: number;
  staffName?: string;
  name?: string;
  appointments?: number;
  collected?: number;
  commissionPending?: number;
  commissionTotal?: number;
}

export interface IPeakHours {
  byHour?: Array<{ hour: number; count?: number; appointments?: number }>;
  byDayOfWeek?: Array<{
    dayOfWeek: number;
    count?: number;
    appointments?: number;
  }>;
}

export interface IFillRate {
  availableMinutes?: number;
  bookedMinutes?: number;
  bufferMinutes?: number;
  fillRate?: number;
}

export interface ICustomersSummary {
  newCustomers?: number;
  returningCustomers?: number;
  retention?: number;
  retentionRate?: number;
  avgVisitGapDays?: number;
  averageVisitGapDays?: number;
  approvedReviews?: number;
}

export interface ITopCustomerRow {
  customerId?: number;
  fullName?: string;
  name?: string;
  collected?: number;
  visits?: number;
  totalVisits?: number;
}

export interface IAtRiskCustomerRow {
  customerId?: number;
  fullName?: string;
  name?: string;
  lastCompletedAt?: string;
  visitCount?: number;
  totalVisits?: number;
}

export type TReportListEntity<T> = TResponse<T[] | { items?: T[] } | T>;
export type TDashboardExportReport =
  | "dashboard-summary"
  | "revenue-by-day"
  | "revenue-by-method"
  | "revenue-by-service"
  | "staff-performance"
  | "customers-top";
