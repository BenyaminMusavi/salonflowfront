"use client";

import { useMemo, useState } from "react";
import { CaretLeftIcon, ChartLineIcon, HandCoinsIcon } from "@phosphor-icons/react";
import BottomSheet from "@/shared/components/composites/bottom-sheet/BottomSheet";
import { useQueryInvoices } from "@/services/domains/invoices/hooks";
import type { IInvoice } from "@/services/domains/invoices/types/invoices.type";
import { useQueryRevenueByMethod, useQueryZReport, useQueryDashboardSummary } from "@/services/domains/reports/hooks";
import { paymentMethodLabel } from "@/services/domains/reports/utils/report-display";
import { asNumber, asReportRows } from "@/services/domains/reports/utils/report-mappers";
import type { IRevenueByMethodRow } from "@/services/domains/reports/types/reports.type";
import { RouteAddress } from "@/shared/data/routeAddress";
import { formatToman } from "@/shared/utils/salonDisplay";
import { formatSalonDate } from "@/shared/utils/salonTime";
import { cn } from "@/shared/utils/className";
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardSkeleton,
  DashboardToast,
  type DashboardToastState,
} from "../_components";
import { PanelListGroup, PanelListRow } from "../_components/PanelList";
import { PERIOD_LABEL, periodRange, type PeriodId } from "../_components/periods";
import { PaymentStep } from "../_agenda/PaymentStep";

const PERIODS: PeriodId[] = ["today", "yesterday", "week", "month"];
const UNPAID_STATUSES = [2, 3]; // Issued, PartiallyPaid

const chip = (active: boolean) =>
  cn(
    "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
    active ? "bg-primary text-primary-foreground" : "bg-surface-hover text-foreground-muted"
  );

function MoneyLine({ label, amount, strong }: { label: string; amount: number | null | undefined; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className={cn("text-sm", strong ? "font-bold text-foreground" : "text-foreground-muted")}>{label}</span>
      <span className={cn("tabular-nums", strong ? "text-base font-bold text-foreground" : "text-sm text-foreground")}>
        {formatToman(amount ?? 0)} تومان
      </span>
    </div>
  );
}

/**
 * «مالی» — money for a period: what came in (by method), what is still unpaid (collect it right
 * here), and the way to staff payouts and the performance report.
 */
export default function FinanceView() {
  const [period, setPeriod] = useState<PeriodId>("today");
  const [paying, setPaying] = useState<IInvoice | null>(null);
  const [toast, setToast] = useState<DashboardToastState>(null);
  const range = periodRange(period);
  const singleDay = range.from === range.to;

  const zReport = useQueryZReport(singleDay ? range.from : undefined);
  const summary = useQueryDashboardSummary(singleDay ? undefined : range);
  const byMethod = useQueryRevenueByMethod(singleDay ? undefined : range);

  const issued = useQueryInvoices({ status: 2, pageSize: 50 });
  const partial = useQueryInvoices({ status: 3, pageSize: 50 });
  const unpaid = useMemo(
    () =>
      [...(issued.data?.data?.items ?? []), ...(partial.data?.data?.items ?? [])]
        .filter((x) => UNPAID_STATUSES.includes(Number(x.status)) && (x.outstandingAmount ?? 0) > 0)
        .sort((a, b) => String(b.issuedAt ?? "").localeCompare(String(a.issuedAt ?? ""))),
    [issued.data, partial.data]
  );
  const unpaidTotal = unpaid.reduce((sum, x) => sum + (x.outstandingAmount ?? 0), 0);

  const z = zReport.data?.data;
  const s = summary.data?.data;
  const methodRows = asReportRows<IRevenueByMethodRow>(byMethod.data?.data).filter(
    (r) => (r.collected ?? r.amount ?? 0) > 0
  );
  const loading = singleDay ? zReport.isLoading : summary.isLoading || byMethod.isLoading;

  const total = singleDay ? z?.collectedTotal ?? z?.paymentsTotal : asNumber(s?.collected);
  const lines: { label: string; amount: number }[] = singleDay
    ? [
        { label: "نقد", amount: z?.cashTotal ?? 0 },
        { label: "کارت", amount: z?.cardTotal ?? 0 },
        { label: "انتقال", amount: z?.transferTotal ?? 0 },
        { label: "آنلاین", amount: z?.onlineTotal ?? 0 },
        { label: "کیف پول", amount: z?.walletTotal ?? 0 },
      ].filter((l, i) => i < 3 || l.amount > 0)
    : methodRows.map((r) => ({
        label: r.methodName || paymentMethodLabel(r.paymentMethod),
        amount: r.collected ?? r.amount ?? 0,
      }));
  const tips = singleDay
    ? z?.tipsTotal
    : asNumber((s as unknown as Record<string, unknown> | undefined)?.tipsTotal);

  return (
    <DashboardPage className="gap-5">
      <DashboardPageHeader title="مالی" />

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {PERIODS.map((p) => (
          <button key={p} type="button" className={chip(period === p)} onClick={() => setPeriod(p)}>
            {PERIOD_LABEL[p]}
          </button>
        ))}
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="px-1 text-xs font-semibold text-foreground-muted">
          {singleDay ? "صندوق روز" : "دریافتی‌ها"}
        </h2>
        {loading ? (
          <DashboardSkeleton cards={1} rows={4} />
        ) : (
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
            <div className="px-4 py-4">
              <p className="text-xs text-foreground-muted">جمع دریافتی</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                {formatToman(total ?? 0)} <span className="text-sm font-semibold text-foreground-muted">تومان</span>
              </p>
            </div>
            {lines.map((l) => (
              <MoneyLine key={l.label} label={l.label} amount={l.amount} />
            ))}
            {tips ? <MoneyLine label="انعام" amount={tips} /> : null}
            {singleDay && z?.staffCommissionTotal ? (
              <MoneyLine label="سهم پرسنل (کمیسیون)" amount={z.staffCommissionTotal} />
            ) : null}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="px-1 text-xs font-semibold text-foreground-muted">
          پرداخت‌نشده {unpaid.length ? `· ${unpaid.length} مورد · ${formatToman(unpaidTotal)} تومان` : ""}
        </h2>
        {issued.isLoading || partial.isLoading ? (
          <DashboardSkeleton cards={1} rows={2} />
        ) : unpaid.length === 0 ? (
          <p className="rounded-[16px] bg-background-secondary px-4 py-4 text-sm text-foreground-muted">
            همه‌ی نوبت‌های انجام‌شده پرداخت شده‌اند.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
            {unpaid.map((inv) => (
              <button
                key={inv.id}
                type="button"
                onClick={() => setPaying(inv)}
                className="flex items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-surface-hover"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold tabular-nums text-foreground">
                    {formatToman(inv.outstandingAmount)} تومان مانده
                  </span>
                  <span className="block truncate text-xs text-foreground-muted">
                    {inv.issuedAt ? formatSalonDate(inv.issuedAt, { weekday: "long", day: "numeric", month: "long" }) : ""}
                    {inv.invoiceNumber ? ` · فاکتور ${inv.invoiceNumber}` : ""}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-primary">دریافت</span>
                <CaretLeftIcon size={16} className="shrink-0 text-foreground-muted" />
              </button>
            ))}
          </div>
        )}
      </section>

      <PanelListGroup>
        <PanelListRow href={RouteAddress.DASHBOARD.PAYOUTS} icon={HandCoinsIcon} label="تسویه پرسنل" />
        <PanelListRow href={RouteAddress.DASHBOARD.REPORTS} icon={ChartLineIcon} label="گزارش عملکرد" />
      </PanelListGroup>

      <BottomSheet open={!!paying} onClose={() => setPaying(null)}>
        {paying ? (
          <PaymentStep
            appointmentId={paying.appointmentId ?? null}
            invoice={paying}
            fallbackAmount={paying.outstandingAmount ?? 0}
            title={paying.invoiceNumber ? `فاکتور ${paying.invoiceNumber}` : "نوبت انجام‌شده"}
            onDone={() => setPaying(null)}
            onToast={setToast}
          />
        ) : null}
      </BottomSheet>

      <DashboardToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardPage>
  );
}
