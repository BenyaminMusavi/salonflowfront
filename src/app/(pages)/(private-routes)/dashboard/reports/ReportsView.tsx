"use client";

import { useMemo, useState, type ReactNode } from "react";
import { DownloadSimpleIcon } from "@phosphor-icons/react";
import BottomSheet from "@/shared/components/composites/bottom-sheet/BottomSheet";
import { Button } from "@/shared/components/primitives/button/Button";
import {
  useMutateExportReport,
  useQueryAppointmentFunnel,
  useQueryCustomersAtRisk,
  useQueryCustomersSummary,
  useQueryCustomersTop,
  useQueryDashboardSummary,
  useQueryFillRate,
  useQueryOutstanding,
  useQueryPeakHours,
  useQueryRevenueByBranch,
  useQueryRevenueByMethod,
  useQueryRevenueByService,
  useQueryStaffPerformance,
} from "@/services/domains/reports/hooks";
import { asNumber, asReportRows, metricFromUnknown } from "@/services/domains/reports/utils/report-mappers";
import {
  EXPORT_REPORT_OPTIONS,
  WEEKDAY_FA,
  appointmentSourceLabel,
  appointmentStatusLabel,
  formatMoneyOrDash,
  formatRate,
  paymentMethodLabel,
} from "@/services/domains/reports/utils/report-display";
import type {
  IDashboardSummary,
  IReportRangeParams,
  IReportSparklinePoint,
  TDashboardExportReport,
} from "@/services/domains/reports/types/reports.type";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { RouteAddress } from "@/shared/data/routeAddress";
import { APP_LOCALE } from "@/shared/utils/locale";
import { formatSalonDate } from "@/shared/utils/salonTime";
import { cn } from "@/shared/utils/className";
import {
  DashboardDateField,
  DashboardPage,
  DashboardPageHeader,
  DashboardSelect,
  DashboardSkeleton,
  DashboardToast,
  type DashboardToastState,
} from "../_components";
import { PERIOD_LABEL, periodRange, type PeriodId } from "../_components/periods";

type Period = Extract<PeriodId, "week" | "month" | "lastMonth"> | "custom";
type Topic = "money" | "appointments" | "customers" | "services" | "staff";

const TOPICS: { id: Topic; label: string }[] = [
  { id: "money", label: "درآمد" },
  { id: "appointments", label: "نوبت‌ها" },
  { id: "customers", label: "مشتریان" },
  { id: "services", label: "خدمات" },
  { id: "staff", label: "پرسنل" },
];

const chip = (active: boolean) =>
  cn(
    "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
    active ? "bg-primary text-primary-foreground" : "bg-surface-hover text-foreground-muted"
  );

const n = (v: number | null | undefined) => (v == null ? "—" : v.toLocaleString(APP_LOCALE));

function pickMetric(summary: IDashboardSummary | undefined, key: string, group?: "financial" | "operational" | "customers") {
  if (!summary) return { value: null as number | null, percentChange: null as number | null };
  const flat = summary as unknown as Record<string, unknown>;
  const direct = { value: asNumber(flat[key]), percentChange: asNumber(flat[`${key}PercentChange`]) };
  if (direct.value != null || !group || !summary[group]) return direct;
  return metricFromUnknown((summary[group] as Record<string, unknown>)[key]);
}

/** Change vs the previous period; for «bad» metrics (no-show) a rise is shown in warning colour. */
function Change({ value, invert }: { value: number | null; invert?: boolean }) {
  if (value == null) return null;
  const good = invert ? value <= 0 : value >= 0;
  return (
    <span className={cn("text-[11px] font-semibold tabular-nums", good ? "text-success" : "text-warning")}>
      {value >= 0 ? "▲" : "▼"} {Math.abs(Math.round(value))}٪
    </span>
  );
}

function Sparkline({ points }: { points: IReportSparklinePoint[] }) {
  if (points.length < 2) return null;
  const values = points.map((p) => p.collected ?? 0);
  const max = Math.max(...values, 1);
  const w = 320;
  const h = 56;
  const coords = values.map((v, i) => ({
    x: (i / (values.length - 1)) * w,
    y: h - (v / max) * (h - 6) - 3,
  }));
  const d = coords.map((c, i) => `${i ? "L" : "M"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-14 w-full text-primary" role="img" aria-label="روند درآمد" preserveAspectRatio="none">
      <path d={`${d} L${w},${h} L0,${h} Z`} fill="currentColor" className="opacity-15" />
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** A ranked row: label, value, and a faint bar showing its share of the largest row. */
function BarRow({ label, value, share, meta }: { label: string; value: string; share: number; meta?: string }) {
  return (
    <div className="relative px-4 py-3">
      <div className="absolute inset-y-1 right-0 rounded-l-[8px] bg-surface-brand" style={{ width: `${Math.max(2, share * 100)}%` }} />
      <div className="relative flex items-center justify-between gap-3">
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-foreground">{label}</span>
          {meta ? <span className="block truncate text-xs text-foreground-muted">{meta}</span> : null}
        </span>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">{value}</span>
      </div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
      <span className="text-foreground-muted">{label}</span>
      <span className="font-semibold tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function Block({ title, loading, error, empty, children }: { title: string; loading?: boolean; error?: unknown; empty?: boolean; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="px-1 text-xs font-semibold text-foreground-muted">{title}</h3>
      <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
        {loading ? (
          <p className="px-4 py-4 text-xs text-foreground-muted">در حال بارگذاری…</p>
        ) : error ? (
          <p className="px-4 py-4 text-xs text-error">{getApiErrorMessage(error, "دریافت این گزارش ناموفق بود.")}</p>
        ) : empty ? (
          <p className="px-4 py-4 text-xs text-foreground-muted">در این بازه داده‌ای نیست.</p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

function ranked<T>(rows: T[], value: (r: T) => number) {
  const max = Math.max(1, ...rows.map(value));
  return [...rows].sort((a, b) => value(b) - value(a)).map((r) => ({ row: r, share: value(r) / max }));
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** «گزارش عملکرد» — one period, four headline numbers, one trend, then a topic at a time. */
export default function ReportsView() {
  const [period, setPeriod] = useState<Period>("month");
  const [custom, setCustom] = useState(() => periodRange("month"));
  const [customOpen, setCustomOpen] = useState(false);
  const [branchId, setBranchId] = useState<number | undefined>();
  const [topic, setTopic] = useState<Topic>("money");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportName, setExportName] = useState<TDashboardExportReport>("dashboard-summary");
  const [toast, setToast] = useState<DashboardToastState>(null);

  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const branches = useQuerySalonById(salonPublicId || undefined).data?.data?.branches ?? [];
  const range = period === "custom" ? custom : periodRange(period);
  const params = useMemo<IReportRangeParams>(() => ({ ...range, branchId }), [range.from, range.to, branchId]); // eslint-disable-line react-hooks/exhaustive-deps
  const on = (t: Topic) => (topic === t ? params : undefined);

  const summary = useQueryDashboardSummary(params);
  const byMethod = useQueryRevenueByMethod(on("money"));
  const byBranch = useQueryRevenueByBranch(branches.length > 1 ? on("money") : undefined);
  const outstanding = useQueryOutstanding(on("money"));
  const funnel = useQueryAppointmentFunnel(on("appointments"));
  const peak = useQueryPeakHours(on("appointments"));
  const fill = useQueryFillRate(on("appointments"));
  const crm = useQueryCustomersSummary(on("customers"));
  const top = useQueryCustomersTop(topic === "customers" ? { ...params, lifetime: false } : undefined);
  const atRisk = useQueryCustomersAtRisk(topic === "customers" ? { ...params, inactiveDays: 60 } : undefined);
  const byService = useQueryRevenueByService(on("services"));
  const staff = useQueryStaffPerformance(on("staff"));
  const exportMut = useMutateExportReport();

  const s = summary.data?.data;
  const headline = [
    { label: "درآمد", m: pickMetric(s, "collected", "financial"), fmt: (v: number | null) => `${formatMoneyOrDash(v)}` },
    { label: "نوبت انجام‌شده", m: pickMetric(s, "completedCount", "operational"), fmt: n },
    { label: "مشتری جدید", m: pickMetric(s, "newCustomers", "customers"), fmt: n },
    { label: "مراجعه‌نکرده", m: pickMetric(s, "noShowRate", "operational"), fmt: (v: number | null) => formatRate(v), invert: true },
  ];
  const sparkline = Array.isArray(s?.sparkline) ? s.sparkline : [];

  const onExport = async () => {
    try {
      const blob = await exportMut.mutateAsync({ ...params, report: exportName });
      downloadBlob(blob, `${exportName}-${range.from}-${range.to}.csv`);
      setExportOpen(false);
      setToast({ type: "success", message: "فایل آماده شد." });
    } catch (err) {
      setToast({ type: "error", message: getApiErrorMessage(err, "دریافت فایل ناموفق بود.") });
    }
  };

  const rangeLabel = `${formatSalonDate(range.from, { day: "numeric", month: "long" })} تا ${formatSalonDate(range.to, { day: "numeric", month: "long" })}`;

  return (
    <DashboardPage className="gap-5">
      <DashboardPageHeader
        title="گزارش عملکرد"
        description={rangeLabel}
        backHref={RouteAddress.DASHBOARD.FINANCE}
        action={
          <button type="button" onClick={() => setExportOpen(true)} aria-label="دریافت فایل" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-hover">
            <DownloadSimpleIcon size={18} />
          </button>
        }
      />

      <div className="flex flex-col gap-2">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {(["week", "month", "lastMonth"] as const).map((p) => (
            <button key={p} type="button" className={chip(period === p)} onClick={() => setPeriod(p)}>
              {PERIOD_LABEL[p]}
            </button>
          ))}
          <button type="button" className={chip(period === "custom")} onClick={() => setCustomOpen(true)}>
            بازه‌ی دلخواه
          </button>
        </div>
        {branches.length > 1 ? (
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            <button type="button" className={chip(branchId == null)} onClick={() => setBranchId(undefined)}>همه‌ی شعبه‌ها</button>
            {branches.map((b) => (
              <button key={b.publicId} type="button" className={chip(branchId === b.branchId)} onClick={() => setBranchId(b.branchId)}>
                {b.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {summary.isLoading ? (
        <DashboardSkeleton cards={1} rows={3} />
      ) : summary.isError ? (
        <p className="text-sm text-error">{getApiErrorMessage(summary.error, "دریافت گزارش ناموفق بود.")}</p>
      ) : (
        <section className="flex flex-col overflow-hidden rounded-[16px] bg-background-secondary">
          <div className="grid grid-cols-2 divide-x divide-x-reverse divide-y divide-border">
            {headline.map((h) => (
              <div key={h.label} className="flex flex-col gap-0.5 px-4 py-3">
                <span className="text-xs text-foreground-muted">{h.label}</span>
                <span className="text-lg font-bold tabular-nums text-foreground">{h.fmt(h.m.value)}</span>
                <Change value={h.m.percentChange} invert={h.invert} />
              </div>
            ))}
          </div>
          {sparkline.length > 1 ? (
            <div className="border-t border-border px-2 pt-2">
              <Sparkline points={sparkline} />
            </div>
          ) : null}
        </section>
      )}

      <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-full bg-background-secondary p-1">
        {TOPICS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTopic(t.id)}
            className={cn("h-9 flex-1 shrink-0 rounded-full px-3 text-[13px] font-semibold transition-colors", topic === t.id ? "bg-primary text-primary-foreground" : "text-foreground-muted")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {topic === "money" ? (() => {
        const rows = asReportRows<{ paymentMethod?: number; methodName?: string; amount?: number; collected?: number }>(byMethod.data?.data);
        const branchRows = asReportRows<{ branchName?: string; name?: string; amount?: number; collected?: number }>(byBranch.data?.data);
        const o = outstanding.data?.data;
        return (
          <>
            <Block title="به تفکیک روش پرداخت" loading={byMethod.isLoading} error={byMethod.error} empty={rows.length === 0}>
              {ranked(rows, (r) => r.collected ?? r.amount ?? 0).map(({ row, share }, i) => (
                <BarRow key={i} label={row.methodName || paymentMethodLabel(row.paymentMethod)} value={`${formatMoneyOrDash(row.collected ?? row.amount)}`} share={share} />
              ))}
            </Block>
            {branches.length > 1 ? (
              <Block title="به تفکیک شعبه" loading={byBranch.isLoading} error={byBranch.error} empty={branchRows.length === 0}>
                {ranked(branchRows, (r) => r.collected ?? r.amount ?? 0).map(({ row, share }, i) => (
                  <BarRow key={i} label={row.branchName || row.name || "شعبه"} value={`${formatMoneyOrDash(row.collected ?? row.amount)}`} share={share} />
                ))}
              </Block>
            ) : null}
            <Block title="مانده و کسورات" loading={outstanding.isLoading} error={outstanding.error} empty={!o}>
              {o ? (
                <>
                  <Line label="پرداخت‌نشده" value={`${formatMoneyOrDash(asNumber(o.outstanding))}`} />
                  <Line label="بیعانه‌ی در جریان" value={`${formatMoneyOrDash(asNumber(o.depositsInFlight ?? o.depositInProgress))}`} />
                  <Line label="تخفیف" value={`${formatMoneyOrDash(asNumber(o.discounts))}`} />
                  <Line label="مالیات" value={`${formatMoneyOrDash(asNumber(o.tax ?? o.taxTotal))}`} />
                </>
              ) : null}
            </Block>
          </>
        );
      })() : null}

      {topic === "appointments" ? (() => {
        const f = funnel.data?.data;
        const statusRows = f?.byStatus ?? f?.statuses ?? [];
        const sourceRows = f?.bySource ?? f?.sources ?? [];
        const p = peak.data?.data;
        const hours = [...(p?.byHour ?? [])].sort((a, b) => (b.count ?? b.appointments ?? 0) - (a.count ?? a.appointments ?? 0)).slice(0, 5);
        const days = p?.byDayOfWeek ?? [];
        const fillData = fill.data?.data;
        return (
          <>
            <Block title="وضعیت نوبت‌ها" loading={funnel.isLoading} error={funnel.error} empty={statusRows.length === 0}>
              {ranked(statusRows, (r) => r.count ?? 0).map(({ row, share }, i) => (
                <BarRow key={i} label={row.name || (row.status != null ? appointmentStatusLabel(row.status) : "وضعیت")} value={n(row.count ?? 0)} share={share} />
              ))}
            </Block>
            <Block title="از کجا رزرو شده" loading={funnel.isLoading} error={funnel.error} empty={sourceRows.length === 0}>
              {ranked(sourceRows, (r) => r.count ?? 0).map(({ row, share }, i) => (
                <BarRow key={i} label={row.name || appointmentSourceLabel(row.source)} value={n(row.count ?? 0)} share={share} />
              ))}
            </Block>
            <Block title="شلوغ‌ترین ساعت‌ها و روزها" loading={peak.isLoading} error={peak.error} empty={!hours.length && !days.length}>
              {ranked(hours, (r) => r.count ?? r.appointments ?? 0).map(({ row, share }) => (
                <BarRow key={`h${row.hour}`} label={`ساعت ${String(row.hour).padStart(2, "0")}`} value={`${n(row.count ?? row.appointments ?? 0)} نوبت`} share={share} />
              ))}
              {ranked(days, (r) => r.count ?? r.appointments ?? 0).slice(0, 3).map(({ row, share }) => (
                <BarRow key={`d${row.dayOfWeek}`} label={WEEKDAY_FA[row.dayOfWeek] ?? `روز ${row.dayOfWeek}`} value={`${n(row.count ?? row.appointments ?? 0)} نوبت`} share={share} />
              ))}
            </Block>
            <Block title="پرشدن ظرفیت" loading={fill.isLoading} error={fill.error} empty={!fillData}>
              {fillData ? (
                <>
                  <Line label="درصد پرشدن" value={formatRate(fillData.fillRate)} />
                  <Line label="ساعت رزروشده از ساعت کاری" value={`${n(Math.round((fillData.bookedMinutes ?? 0) / 60))} از ${n(Math.round((fillData.availableMinutes ?? 0) / 60))} ساعت`} />
                </>
              ) : null}
            </Block>
          </>
        );
      })() : null}

      {topic === "customers" ? (() => {
        const c = crm.data?.data;
        const topRows = asReportRows<{ fullName?: string; name?: string; collected?: number; visits?: number; totalVisits?: number }>(top.data?.data);
        const riskRows = asReportRows<{ fullName?: string; name?: string; lastCompletedAt?: string; visitCount?: number; totalVisits?: number }>(atRisk.data?.data);
        return (
          <>
            <Block title="خلاصه" loading={crm.isLoading} error={crm.error} empty={!c}>
              {c ? (
                <>
                  <Line label="مشتری جدید" value={n(c.newCustomers)} />
                  <Line label="مشتری بازگشتی" value={n(c.returningCustomers)} />
                  <Line label="درصد بازگشت" value={formatRate(c.retention ?? c.retentionRate)} />
                  <Line label="فاصله‌ی معمول بین مراجعه‌ها" value={`${n(c.avgVisitGapDays ?? c.averageVisitGapDays)} روز`} />
                </>
              ) : null}
            </Block>
            <Block title="مشتریان برتر" loading={top.isLoading} error={top.error} empty={topRows.length === 0}>
              {ranked(topRows, (r) => r.collected ?? 0).map(({ row, share }, i) => (
                <BarRow key={i} label={row.fullName || row.name || "مشتری"} meta={`${n(row.visits ?? row.totalVisits)} مراجعه`} value={`${formatMoneyOrDash(row.collected)}`} share={share} />
              ))}
            </Block>
            <Block title="مدتی نیامده‌اند (بیش از 60 روز)" loading={atRisk.isLoading} error={atRisk.error} empty={riskRows.length === 0}>
              {riskRows.map((row, i) => (
                <Line
                  key={i}
                  label={row.fullName || row.name || "مشتری"}
                  value={row.lastCompletedAt ? `آخرین بار ${formatSalonDate(row.lastCompletedAt, { day: "numeric", month: "long" })}` : "—"}
                />
              ))}
            </Block>
          </>
        );
      })() : null}

      {topic === "services" ? (() => {
        const rows = asReportRows<{ serviceName?: string; name?: string; amount?: number; collected?: number; count?: number }>(byService.data?.data);
        return (
          <Block title="پرفروش‌ترین خدمات" loading={byService.isLoading} error={byService.error} empty={rows.length === 0}>
            {ranked(rows, (r) => r.collected ?? r.amount ?? 0).map(({ row, share }, i) => (
              <BarRow key={i} label={row.serviceName || row.name || "خدمت"} meta={row.count != null ? `${n(row.count)} بار` : undefined} value={`${formatMoneyOrDash(row.collected ?? row.amount)}`} share={share} />
            ))}
          </Block>
        );
      })() : null}

      {topic === "staff" ? (() => {
        const rows = asReportRows<{ staffName?: string; name?: string; appointments?: number; collected?: number; commissionPending?: number; commissionTotal?: number }>(staff.data?.data);
        return (
          <Block title="عملکرد پرسنل" loading={staff.isLoading} error={staff.error} empty={rows.length === 0}>
            {ranked(rows, (r) => r.collected ?? 0).map(({ row, share }, i) => (
              <BarRow
                key={i}
                label={row.staffName || row.name || "پرسنل"}
                meta={`${n(row.appointments)} نوبت · کمیسیون ${formatMoneyOrDash(row.commissionTotal ?? row.commissionPending)}`}
                value={`${formatMoneyOrDash(row.collected)}`}
                share={share}
              />
            ))}
          </Block>
        );
      })() : null}

      <BottomSheet open={customOpen} onClose={() => setCustomOpen(false)}>
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-bold text-foreground">بازه‌ی دلخواه</h2>
          <div className="grid grid-cols-2 gap-2">
            <DashboardDateField name="report-from" label="از" value={custom.from} onChange={(from) => from && setCustom((c) => ({ ...c, from }))} />
            <DashboardDateField name="report-to" label="تا" value={custom.to} onChange={(to) => to && setCustom((c) => ({ ...c, to }))} />
          </div>
          <Button
            type="button"
            className="w-full rounded-[12px]"
            disabled={custom.from > custom.to}
            onClick={() => {
              setPeriod("custom");
              setCustomOpen(false);
            }}
          >
            نمایش
          </Button>
        </div>
      </BottomSheet>

      <BottomSheet open={exportOpen} onClose={() => setExportOpen(false)}>
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-bold text-foreground">دریافت فایل اکسل</h2>
          <p className="text-xs text-foreground-muted">برای {rangeLabel}</p>
          <DashboardSelect value={exportName} onChange={(e) => setExportName(e.target.value as TDashboardExportReport)}>
            {EXPORT_REPORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </DashboardSelect>
          <Button type="button" className="w-full rounded-[12px]" isLoading={exportMut.isPending} onClick={() => void onExport()}>
            دریافت فایل
          </Button>
        </div>
      </BottomSheet>

      <DashboardToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardPage>
  );
}
