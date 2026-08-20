"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import reportsService from "../reports.service";
import { IReportRangeParams, TDashboardExportReport } from "../types/reports.type";

export const Z_REPORT_QUERY_KEY = "Z_REPORT_QUERY_KEY";
export const DASHBOARD_SUMMARY_QUERY_KEY = "DASHBOARD_SUMMARY_QUERY_KEY";
export const REPORTS_QUERY_KEY = "REPORTS_QUERY_KEY";

function useRangeEnabled(params: IReportRangeParams | undefined) {
  const salonId = useSalonContextStore((s) => s.salonId);
  return !!salonId && !!params?.from && !!params?.to;
}

export const useQueryZReport = (date: string | undefined) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [Z_REPORT_QUERY_KEY, salonId, date],
    queryFn: () =>
      reportsService.getZReport({ salonId: salonId!, date: date! }),
    enabled: !!salonId && !!date,
  });
};

export const useQueryDashboardSummary = (params: IReportRangeParams | undefined) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [DASHBOARD_SUMMARY_QUERY_KEY, salonId, params],
    queryFn: () => reportsService.getDashboardSummary(params!),
    enabled: useRangeEnabled(params),
  });
};

export const useQueryRevenueByMethod = (params: IReportRangeParams | undefined) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, "revenue-by-method", salonId, params],
    queryFn: () => reportsService.getRevenueByMethod(params!),
    enabled: useRangeEnabled(params),
  });
};

export const useQueryRevenueByService = (params: IReportRangeParams | undefined) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, "revenue-by-service", salonId, params],
    queryFn: () => reportsService.getRevenueByService(params!),
    enabled: useRangeEnabled(params),
  });
};

export const useQueryRevenueByBranch = (params: IReportRangeParams | undefined) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, "revenue-by-branch", salonId, params],
    queryFn: () => reportsService.getRevenueByBranch(params!),
    enabled: useRangeEnabled(params),
  });
};

export const useQueryRevenueByDay = (params: IReportRangeParams | undefined) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, "revenue-by-day", salonId, params],
    queryFn: () => reportsService.getRevenueByDay(params!),
    enabled: useRangeEnabled(params),
  });
};

export const useQueryOutstanding = (params: IReportRangeParams | undefined) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, "outstanding", salonId, params],
    queryFn: () => reportsService.getOutstanding(params!),
    enabled: useRangeEnabled(params),
  });
};

export const useQueryAppointmentFunnel = (params: IReportRangeParams | undefined) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, "appointment-funnel", salonId, params],
    queryFn: () => reportsService.getAppointmentFunnel(params!),
    enabled: useRangeEnabled(params),
  });
};

export const useQueryStaffPerformance = (params: IReportRangeParams | undefined) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, "staff-performance", salonId, params],
    queryFn: () => reportsService.getStaffPerformance(params!),
    enabled: useRangeEnabled(params),
  });
};

export const useQueryPeakHours = (params: IReportRangeParams | undefined) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, "peak-hours", salonId, params],
    queryFn: () => reportsService.getPeakHours(params!),
    enabled: useRangeEnabled(params),
  });
};

export const useQueryFillRate = (params: IReportRangeParams | undefined) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, "fill-rate", salonId, params],
    queryFn: () => reportsService.getFillRate(params!),
    enabled: useRangeEnabled(params),
  });
};

export const useQueryCustomersSummary = (params: IReportRangeParams | undefined) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, "customers-summary", salonId, params],
    queryFn: () => reportsService.getCustomersSummary(params!),
    enabled: useRangeEnabled(params),
  });
};

export const useQueryCustomersTop = (
  params: (IReportRangeParams & { lifetime?: boolean }) | undefined
) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, "customers-top", salonId, params],
    queryFn: () => reportsService.getCustomersTop(params!),
    enabled: useRangeEnabled(params),
  });
};

export const useQueryCustomersAtRisk = (
  params: (IReportRangeParams & { inactiveDays?: number }) | undefined
) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, "customers-at-risk", salonId, params],
    queryFn: () => reportsService.getCustomersAtRisk(params!),
    enabled: useRangeEnabled(params),
  });
};

export const useMutateExportReport = () => {
  return useMutation({
    mutationFn: (params: IReportRangeParams & { report: TDashboardExportReport }) =>
      reportsService.exportCsv(params),
  });
};
