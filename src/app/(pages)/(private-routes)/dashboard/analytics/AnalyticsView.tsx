"use client";

import { useMemo, useState } from "react";
import { Input } from "@/shared/components/primitives/input/Input";
import { useQueryDashboardSummary } from "@/services/domains/reports/hooks";
import { defaultReportRange } from "@/services/domains/reports/utils/report-mappers";
import { asNumber, metricFromUnknown } from "@/services/domains/reports/utils/report-mappers";
import {
  formatMoneyOrDash,
  formatPercentChange,
  formatRate,
} from "@/services/domains/reports/utils/report-display";
import { IDashboardSummary, IReportSparklinePoint } from "@/services/domains/reports/types/reports.type";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";

function pickMetric(
  summary: IDashboardSummary | undefined,
  key: string,
  nestedGroup?: "financial" | "operational" | "customers"
): { value: number | null; percentChange: number | null } {
  if (!summary) return { value: null, percentChange: null };
  const direct = (summary as Record<string, unknown>)[key];
  const changeKey = `${key}PercentChange`;
  const fromFlat = {
    value: asNumber(direct),
    percentChange: asNumber((summary as Record<string, unknown>)[changeKey]),
  };
  if (fromFlat.value != null) return fromFlat;
  if (nestedGroup && summary[nestedGroup]) {
    return metricFromUnknown(
      (summary[nestedGroup] as Record<string, unknown>)[key]
    );
  }
  return fromFlat;
}

function Sparkline({ points }: { points: IReportSparklinePoint[] }) {
  const values = points.map((p) => p.collected ?? 0);
  const max = Math.max(...values, 1);
  const w = 320;
  const h = 56;
  const d = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * w;
      const y = h - (v / max) * (h - 4) - 2;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  if (points.length === 0) {
    return (
      <p className="text-xs text-foreground-muted">نقطه‌ای برای نمودار نیست.</p>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-14 w-full text-primary"
      role="img"
      aria-label="روند دریافت"
    >
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function KpiCard({
  title,
  value,
  percentChange,
}: {
  title: string;
  value: string;
  percentChange: number | null;
}) {
  const change = formatPercentChange(percentChange);
  return (
    <div className="rounded-lg bg-surface p-3">
      <p className="text-xs text-foreground-muted">{title}</p>
      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
      {change ? (
        <p
          className={`mt-1 text-[11px] ${
            (percentChange ?? 0) >= 0 ? "text-primary" : "text-error"
          }`}
        >
          {change}
        </p>
      ) : null}
    </div>
  );
}

export default function AnalyticsView() {
  const defaults = defaultReportRange();
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [branchId, setBranchId] = useState<number | "">("");
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

  const query = useQueryDashboardSummary(params);
  const summary = query.data?.data;

  const collected = pickMetric(summary, "collected", "financial");
  const tillCollected = pickMetric(summary, "tillCollected", "financial");
  const serviceRevenue = pickMetric(summary, "serviceRevenue", "financial");
  const netCollected = pickMetric(summary, "netCollected", "financial");
  const outstanding = pickMetric(summary, "outstanding", "financial");
  const cancelRate = pickMetric(summary, "cancelRate", "operational");
  const noShowRate = pickMetric(summary, "noShowRate", "operational");
  const newCustomers = pickMetric(summary, "newCustomers", "customers");
  const returningCustomers = pickMetric(
    summary,
    "returningCustomers",
    "customers"
  );

  const sparkline = Array.isArray(summary?.sparkline)
    ? summary.sparkline
    : [];

  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-col gap-4 px-safe-area pb-8">
      <div className="rounded-lg bg-surface-secondary p-3">
        <h1 className="mb-2 text-base font-bold text-foreground">
          تحلیل و KPI
        </h1>
        <p className="mb-3 text-xs text-foreground-muted">
          کارت‌های مالی، عملیاتی و مشتری برای بازه انتخابی. دوره قبلی هم‌طول را
          سرور در درصد تغییر برمی‌گرداند.
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
      </div>

      {query.isLoading ? (
        <p className="text-sm text-foreground-muted">در حال دریافت خلاصه…</p>
      ) : query.isError ? (
        <p className="text-sm text-error">
          {getApiErrorMessage(query.error, "دریافت خلاصه داشبورد ناموفق بود.")}
        </p>
      ) : (
        <>
          <div className="rounded-lg bg-surface-secondary p-3">
            <p className="mb-2 text-xs font-bold text-foreground-muted">
              روند دریافت (sparkline)
            </p>
            <Sparkline points={sparkline} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <KpiCard
              title="دریافت‌شده"
              value={formatMoneyOrDash(collected.value)}
              percentChange={collected.percentChange}
            />
            <KpiCard
              title="صندوق (نقد+کارت+آنلاین)"
              value={formatMoneyOrDash(tillCollected.value)}
              percentChange={tillCollected.percentChange}
            />
            <KpiCard
              title="درآمد خدمات"
              value={formatMoneyOrDash(serviceRevenue.value)}
              percentChange={serviceRevenue.percentChange}
            />
            <KpiCard
              title="خالص پس از استرداد"
              value={formatMoneyOrDash(netCollected.value)}
              percentChange={netCollected.percentChange}
            />
            <KpiCard
              title="مطالبات"
              value={formatMoneyOrDash(outstanding.value)}
              percentChange={outstanding.percentChange}
            />
            <KpiCard
              title="نرخ لغو"
              value={formatRate(cancelRate.value)}
              percentChange={cancelRate.percentChange}
            />
            <KpiCard
              title="نرخ عدم حضور"
              value={formatRate(noShowRate.value)}
              percentChange={noShowRate.percentChange}
            />
            <KpiCard
              title="مشتری جدید"
              value={
                newCustomers.value != null
                  ? String(newCustomers.value)
                  : "—"
              }
              percentChange={newCustomers.percentChange}
            />
            <KpiCard
              title="مشتری بازگشتی"
              value={
                returningCustomers.value != null
                  ? String(returningCustomers.value)
                  : "—"
              }
              percentChange={returningCustomers.percentChange}
            />
          </div>
        </>
      )}
    </div>
  );
}
