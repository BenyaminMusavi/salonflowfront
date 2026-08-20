"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/shared/components/primitives/button/Button";
import { Input } from "@/shared/components/primitives/input/Input";
import {
  useMutateExportReport,
  useQueryAppointmentFunnel,
  useQueryCustomersAtRisk,
  useQueryCustomersSummary,
  useQueryCustomersTop,
  useQueryFillRate,
  useQueryOutstanding,
  useQueryPeakHours,
  useQueryRevenueByBranch,
  useQueryRevenueByDay,
  useQueryRevenueByMethod,
  useQueryRevenueByService,
  useQueryStaffPerformance,
} from "@/services/domains/reports/hooks";
import { asNumber, asReportRows, defaultReportRange } from "@/services/domains/reports/utils/report-mappers";
import {
  EXPORT_REPORT_OPTIONS,
  WEEKDAY_FA,
  appointmentSourceLabel,
  appointmentStatusLabel,
  formatMoneyOrDash,
  formatRate,
  paymentMethodLabel,
} from "@/services/domains/reports/utils/report-display";
import { TDashboardExportReport } from "@/services/domains/reports/types/reports.type";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { formatAppointmentDateTime } from "@/services/domains/appointments/utils/appointment-display";

function Section({
  title,
  loading,
  error,
  children,
}: {
  title: string;
  loading?: boolean;
  error?: unknown;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg bg-surface-secondary p-3">
      <h2 className="mb-3 text-sm font-bold text-foreground">{title}</h2>
      {loading ? (
        <p className="text-xs text-foreground-muted">در حال بارگذاری…</p>
      ) : error ? (
        <p className="text-xs text-error">
          {getApiErrorMessage(error, "دریافت این گزارش ناموفق بود.")}
        </p>
      ) : (
        children
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1 text-sm">
      <span className="text-foreground-muted">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsView() {
  const defaults = defaultReportRange();
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [branchId, setBranchId] = useState<number | "">("");
  const [exportName, setExportName] =
    useState<TDashboardExportReport>("dashboard-summary");
  const [exportError, setExportError] = useState("");

  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const salonDetail = useQuerySalonById(salonPublicId || undefined);
  const branches = salonDetail.data?.data?.branches ?? [];

  const params = useMemo(
    () => ({
      from,
      to,
      branchId: branchId === "" ? undefined : Number(branchId),
    }),
    [from, to, branchId]
  );

  const byMethod = useQueryRevenueByMethod(params);
  const byService = useQueryRevenueByService(params);
  const byBranch = useQueryRevenueByBranch(params);
  const byDay = useQueryRevenueByDay(params);
  const outstanding = useQueryOutstanding(params);
  const funnel = useQueryAppointmentFunnel(params);
  const staff = useQueryStaffPerformance(params);
  const peak = useQueryPeakHours(params);
  const fill = useQueryFillRate(params);
  const crmSummary = useQueryCustomersSummary(params);
  const topCustomers = useQueryCustomersTop({ ...params, lifetime: false });
  const atRisk = useQueryCustomersAtRisk({ ...params, inactiveDays: 60 });
  const exportMut = useMutateExportReport();

  const methodRows = asReportRows<{
    paymentMethod?: number;
    methodName?: string;
    amount?: number;
    collected?: number;
    refunds?: number;
  }>(byMethod.data?.data);
  const serviceRows = asReportRows<{
    serviceName?: string;
    name?: string;
    amount?: number;
    collected?: number;
    count?: number;
  }>(byService.data?.data);
  const branchRows = asReportRows<{
    branchName?: string;
    name?: string;
    amount?: number;
    collected?: number;
  }>(byBranch.data?.data);
  const dayRows = asReportRows<{
    date: string;
    collected?: number;
    amount?: number;
    appointments?: number;
  }>(byDay.data?.data);
  const staffRows = asReportRows<{
    staffName?: string;
    name?: string;
    appointments?: number;
    collected?: number;
    commissionPending?: number;
    commissionTotal?: number;
  }>(staff.data?.data);
  const topRows = asReportRows<{
    fullName?: string;
    name?: string;
    collected?: number;
    visits?: number;
    totalVisits?: number;
  }>(topCustomers.data?.data);
  const riskRows = asReportRows<{
    fullName?: string;
    name?: string;
    lastCompletedAt?: string;
    visitCount?: number;
    totalVisits?: number;
  }>(atRisk.data?.data);

  const outstandingData = outstanding.data?.data;
  const funnelData = funnel.data?.data;
  const peakData = peak.data?.data;
  const fillData = fill.data?.data;
  const crm = crmSummary.data?.data;

  const statusRows = funnelData?.byStatus ?? funnelData?.statuses ?? [];
  const sourceRows = funnelData?.bySource ?? funnelData?.sources ?? [];

  const onExport = async () => {
    setExportError("");
    try {
      const blob = await exportMut.mutateAsync({
        ...params,
        report: exportName,
      });
      downloadBlob(blob, `${exportName}-${from}-${to}.csv`);
    } catch (err) {
      setExportError(getApiErrorMessage(err, "خروجی CSV ناموفق بود."));
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-col gap-4 px-safe-area pb-8">
      <div className="rounded-lg bg-surface-secondary p-3">
        <h1 className="mb-2 text-base font-bold text-foreground">گزارش‌ها</h1>
        <p className="mb-3 text-xs text-foreground-muted">
          مالی، عملیاتی، پرسنل و CRM. تاریخ‌ها به صورت yyyy-MM-dd به API می‌روند.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-10 min-h-10"
          />
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-10 min-h-10"
          />
        </div>
        <select
          className="mt-2 h-12 w-full rounded-[2px] bg-foreground/5 px-3 text-sm text-foreground"
          value={branchId}
          onChange={(e) =>
            setBranchId(e.target.value ? Number(e.target.value) : "")
          }
        >
          <option value="">همه شعبه‌ها</option>
          {branches.map((branch) => (
            <option
              key={String(branch.id ?? branch.publicId)}
              value={branch.id ?? ""}
            >
              {branch.name}
            </option>
          ))}
        </select>
        <div className="mt-3 flex flex-col gap-2">
          <select
            className="h-12 w-full rounded-[2px] bg-foreground/5 px-3 text-sm text-foreground"
            value={exportName}
            onChange={(e) =>
              setExportName(e.target.value as TDashboardExportReport)
            }
          >
            {EXPORT_REPORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Button
            type="button"
            onClick={() => void onExport()}
            isLoading={exportMut.isPending}
          >
            خروجی CSV
          </Button>
          {exportError ? <p className="text-xs text-error">{exportError}</p> : null}
        </div>
      </div>

      <Section
        title="درآمد بر اساس روش پرداخت"
        loading={byMethod.isLoading}
        error={byMethod.error}
      >
        {methodRows.length === 0 ? (
          <p className="text-xs text-foreground-muted">داده‌ای نیست.</p>
        ) : (
          methodRows.map((row, i) => (
            <Row
              key={`${row.paymentMethod ?? row.methodName ?? i}`}
              label={
                row.methodName || paymentMethodLabel(row.paymentMethod)
              }
              value={`${formatMoneyOrDash(row.collected ?? row.amount)}${
                row.refunds != null ? ` / استرداد ${formatMoneyOrDash(row.refunds)}` : ""
              }`}
            />
          ))
        )}
      </Section>

      <Section
        title="درآمد بر اساس خدمت (۲۰ مورد برتر)"
        loading={byService.isLoading}
        error={byService.error}
      >
        {serviceRows.length === 0 ? (
          <p className="text-xs text-foreground-muted">داده‌ای نیست.</p>
        ) : (
          serviceRows.map((row, i) => (
            <Row
              key={`${row.serviceName ?? row.name ?? i}`}
              label={`${row.serviceName || row.name || "خدمت"} ${
                row.count != null ? `(${row.count})` : ""
              }`}
              value={formatMoneyOrDash(row.collected ?? row.amount)}
            />
          ))
        )}
      </Section>

      <Section
        title="درآمد بر اساس شعبه"
        loading={byBranch.isLoading}
        error={byBranch.error}
      >
        {branchRows.length === 0 ? (
          <p className="text-xs text-foreground-muted">داده‌ای نیست.</p>
        ) : (
          branchRows.map((row, i) => (
            <Row
              key={`${row.branchName ?? row.name ?? i}`}
              label={row.branchName || row.name || "شعبه"}
              value={formatMoneyOrDash(row.collected ?? row.amount)}
            />
          ))
        )}
      </Section>

      <Section
        title="سری روزانه"
        loading={byDay.isLoading}
        error={byDay.error}
      >
        {dayRows.length === 0 ? (
          <p className="text-xs text-foreground-muted">داده‌ای نیست.</p>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {dayRows.map((row) => (
              <Row
                key={row.date}
                label={`${row.date}${
                  row.appointments != null ? ` · ${row.appointments} نوبت` : ""
                }`}
                value={formatMoneyOrDash(row.collected ?? row.amount)}
              />
            ))}
          </div>
        )}
      </Section>

      <Section
        title="مطالبات و کسورات"
        loading={outstanding.isLoading}
        error={outstanding.error}
      >
        {outstandingData ? (
          <>
            <Row
              label="مانده فاکتور"
              value={formatMoneyOrDash(asNumber(outstandingData.outstanding))}
            />
            <Row
              label="بیعانه در جریان"
              value={formatMoneyOrDash(
                asNumber(
                  outstandingData.depositsInFlight ??
                    outstandingData.depositInProgress
                )
              )}
            />
            <Row
              label="تخفیف بازه"
              value={formatMoneyOrDash(asNumber(outstandingData.discounts))}
            />
            <Row
              label="مالیات بازه"
              value={formatMoneyOrDash(
                asNumber(outstandingData.tax ?? outstandingData.taxTotal)
              )}
            />
          </>
        ) : (
          <p className="text-xs text-foreground-muted">داده‌ای نیست.</p>
        )}
      </Section>

      <Section
        title="قیف نوبت"
        loading={funnel.isLoading}
        error={funnel.error}
      >
        <p className="mb-1 text-[11px] text-foreground-muted">وضعیت</p>
        {statusRows.length === 0 ? (
          <p className="text-xs text-foreground-muted">داده‌ای نیست.</p>
        ) : (
          statusRows.map((row, i) => (
            <Row
              key={`st-${row.status ?? row.name ?? i}`}
              label={
                row.name ||
                (row.status != null
                  ? appointmentStatusLabel(row.status)
                  : "وضعیت")
              }
              value={String(row.count ?? 0)}
            />
          ))
        )}
        <p className="mt-3 mb-1 text-[11px] text-foreground-muted">کانال رزرو</p>
        {sourceRows.length === 0 ? (
          <p className="text-xs text-foreground-muted">داده‌ای نیست.</p>
        ) : (
          sourceRows.map((row, i) => (
            <Row
              key={`src-${row.source ?? row.name ?? i}`}
              label={
                row.name || appointmentSourceLabel(row.source)
              }
              value={String(row.count ?? 0)}
            />
          ))
        )}
      </Section>

      <Section
        title="عملکرد پرسنل"
        loading={staff.isLoading}
        error={staff.error}
      >
        {staffRows.length === 0 ? (
          <p className="text-xs text-foreground-muted">داده‌ای نیست.</p>
        ) : (
          staffRows.map((row, i) => (
            <div
              key={`${row.staffName ?? row.name ?? i}`}
              className="border-b border-border py-2 last:border-0"
            >
              <p className="text-sm font-semibold text-foreground">
                {row.staffName || row.name || "پرسنل"}
              </p>
              <p className="text-xs text-foreground-muted">
                نوبت: {row.appointments ?? "—"} · دریافت:{" "}
                {formatMoneyOrDash(row.collected)} · کمیسیون:{" "}
                {formatMoneyOrDash(
                  row.commissionPending ?? row.commissionTotal
                )}
              </p>
            </div>
          ))
        )}
      </Section>

      <Section
        title="ساعات اوج"
        loading={peak.isLoading}
        error={peak.error}
      >
        {(peakData?.byHour ?? []).map((row) => (
          <Row
            key={`h-${row.hour}`}
            label={`${String(row.hour).padStart(2, "0")}:00`}
            value={String(row.count ?? row.appointments ?? 0)}
          />
        ))}
        {(peakData?.byDayOfWeek ?? []).map((row) => (
          <Row
            key={`d-${row.dayOfWeek}`}
            label={WEEKDAY_FA[row.dayOfWeek] ?? `روز ${row.dayOfWeek}`}
            value={String(row.count ?? row.appointments ?? 0)}
          />
        ))}
        {!peakData?.byHour?.length && !peakData?.byDayOfWeek?.length ? (
          <p className="text-xs text-foreground-muted">داده‌ای نیست.</p>
        ) : null}
      </Section>

      <Section
        title="نرخ پرشدن"
        loading={fill.isLoading}
        error={fill.error}
      >
        {fillData ? (
          <>
            <Row
              label="دقایق در دسترس"
              value={String(fillData.availableMinutes ?? "—")}
            />
            <Row
              label="دقایق رزرو شده"
              value={String(fillData.bookedMinutes ?? "—")}
            />
            <Row
              label="بافر"
              value={String(fillData.bufferMinutes ?? "—")}
            />
            <Row label="Fill rate" value={formatRate(fillData.fillRate)} />
          </>
        ) : (
          <p className="text-xs text-foreground-muted">داده‌ای نیست.</p>
        )}
      </Section>

      <Section
        title="خلاصه CRM"
        loading={crmSummary.isLoading}
        error={crmSummary.error}
      >
        {crm ? (
          <>
            <Row label="مشتری جدید" value={String(crm.newCustomers ?? "—")} />
            <Row
              label="بازگشتی"
              value={String(crm.returningCustomers ?? "—")}
            />
            <Row
              label="نگه‌داشت"
              value={formatRate(crm.retention ?? crm.retentionRate)}
            />
            <Row
              label="میانگین فاصله مراجعه (روز)"
              value={String(
                crm.avgVisitGapDays ?? crm.averageVisitGapDays ?? "—"
              )}
            />
            <Row
              label="نظرات تأییدشده"
              value={String(crm.approvedReviews ?? "—")}
            />
          </>
        ) : (
          <p className="text-xs text-foreground-muted">داده‌ای نیست.</p>
        )}
      </Section>

      <Section
        title="مشتریان برتر"
        loading={topCustomers.isLoading}
        error={topCustomers.error}
      >
        {topRows.length === 0 ? (
          <p className="text-xs text-foreground-muted">داده‌ای نیست.</p>
        ) : (
          topRows.map((row, i) => (
            <Row
              key={`${row.fullName ?? row.name ?? i}`}
              label={`${row.fullName || row.name || "مشتری"} · ${
                row.visits ?? row.totalVisits ?? "—"
              } مراجعه`}
              value={formatMoneyOrDash(row.collected)}
            />
          ))
        )}
      </Section>

      <Section
        title="مشتریان در معرض ریزش (۶۰ روز)"
        loading={atRisk.isLoading}
        error={atRisk.error}
      >
        {riskRows.length === 0 ? (
          <p className="text-xs text-foreground-muted">داده‌ای نیست.</p>
        ) : (
          riskRows.map((row, i) => (
            <div
              key={`${row.fullName ?? row.name ?? i}`}
              className="border-b border-border py-2 last:border-0"
            >
              <p className="text-sm font-semibold text-foreground">
                {row.fullName || row.name || "مشتری"}
              </p>
              <p className="text-xs text-foreground-muted">
                آخرین تکمیل:{" "}
                {row.lastCompletedAt
                  ? formatAppointmentDateTime(row.lastCompletedAt)
                  : "—"}{" "}
                · مراجعه: {row.visitCount ?? row.totalVisits ?? "—"}
              </p>
            </div>
          ))
        )}
      </Section>
    </div>
  );
}
