"use client";

import { useMemo, useState } from "react";
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
import {
  DashboardCard,
  DashboardDateField,
  DashboardEmptyState,
  DashboardKpi,
  DashboardPage,
  DashboardPageHeader,
  DashboardSelect,
  DashboardSkeleton,
} from "../_components";

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
  const h = 72;
  const coords = values.map((v, i) => {
    const x = (i / Math.max(values.length - 1, 1)) * w;
    const y = h - (v / max) * (h - 8) - 4;
    return { x, y };
  });
  const d = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");
  const area = coords.length
    ? `${d} L${coords[coords.length - 1].x.toFixed(1)},${h} L${coords[0].x.toFixed(1)},${h} Z`
    : "";

  if (points.length === 0) {
    return (
      <p className="text-xs text-foreground-muted">نقطه‌ای برای نمودار نیست.</p>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-20 w-full text-primary"
      role="img"
      aria-label="روند دریافت"
    >
      <path d={area} fill="currentColor" className="opacity-20" />
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2.5" />
    </svg>
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

  const kpis = [
    {
      group: "مالی",
      items: [
        { title: "دریافت‌شده", value: formatMoneyOrDash(collected.value), change: collected.percentChange },
        { title: "صندوق", value: formatMoneyOrDash(tillCollected.value), change: tillCollected.percentChange },
        { title: "درآمد خدمات", value: formatMoneyOrDash(serviceRevenue.value), change: serviceRevenue.percentChange },
        { title: "خالص پس از استرداد", value: formatMoneyOrDash(netCollected.value), change: netCollected.percentChange },
        { title: "مطالبات", value: formatMoneyOrDash(outstanding.value), change: outstanding.percentChange },
      ],
    },
    {
      group: "عملیاتی",
      items: [
        { title: "نرخ لغو", value: formatRate(cancelRate.value), change: cancelRate.percentChange },
        { title: "نرخ عدم حضور", value: formatRate(noShowRate.value), change: noShowRate.percentChange },
      ],
    },
    {
      group: "مشتری",
      items: [
        {
          title: "مشتری جدید",
          value: newCustomers.value != null ? String(newCustomers.value) : "—",
          change: newCustomers.percentChange,
        },
        {
          title: "مشتری بازگشتی",
          value:
            returningCustomers.value != null
              ? String(returningCustomers.value)
              : "—",
          change: returningCustomers.percentChange,
        },
      ],
    },
  ];

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="تحلیل"
        description="شاخص‌های مالی، عملیاتی و مشتری برای بازه انتخابی."
      />

      <DashboardCard className="sticky top-[4.5rem] z-10 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <DashboardDateField name="analytics-from" value={from} onChange={setFrom} label="از" />
          <DashboardDateField name="analytics-to" value={to} onChange={setTo} label="تا" />
        </div>
        <DashboardSelect
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
        </DashboardSelect>
      </DashboardCard>

      {query.isLoading ? (
        <DashboardSkeleton cards={2} rows={2} />
      ) : query.isError ? (
        <DashboardEmptyState
          title="دریافت خلاصه ناموفق بود"
          description={getApiErrorMessage(
            query.error,
            "دریافت خلاصه داشبورد ناموفق بود."
          )}
        />
      ) : (
        <>
          <DashboardCard>
            <p className="mb-2 text-xs font-bold text-foreground-muted">
              روند دریافت
            </p>
            <Sparkline points={sparkline} />
          </DashboardCard>

          {kpis.map((group) => (
            <div key={group.group} className="space-y-2">
              <p className="px-1 text-xs font-bold text-foreground-muted">
                {group.group}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {group.items.map((item) => (
                  <DashboardKpi
                    key={item.title}
                    title={item.title}
                    value={item.value}
                    hint={formatPercentChange(item.change)}
                  />
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </DashboardPage>
  );
}
