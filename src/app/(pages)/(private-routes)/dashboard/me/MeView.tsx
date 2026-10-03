"use client";

import { useState } from "react";
import { BellIcon, CalendarCheckIcon, CalendarDotsIcon } from "@phosphor-icons/react";
import { useQueryMyEarnings } from "@/services/domains/payouts/hooks";
import { RouteAddress } from "@/shared/data/routeAddress";
import { formatToman } from "@/shared/utils/salonDisplay";
import { formatSalonDate } from "@/shared/utils/salonTime";
import { cn } from "@/shared/utils/className";
import { DashboardPage, DashboardPageHeader } from "../_components";
import { PanelListGroup, PanelListRow } from "../_components/PanelList";
import { PERIOD_LABEL, periodRange } from "../_components/periods";

const PAYOUT = { Draft: 1, Approved: 2, Paid: 3 };

const chip = (active: boolean) =>
  cn(
    "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
    active ? "bg-primary text-primary-foreground" : "bg-surface-hover text-foreground-muted"
  );

const shortDate = (d?: string | null) => (d ? formatSalonDate(d, { day: "numeric", month: "long" }) : "");

/** «درآمد من» — the staff member's own share for a month and their payouts. */
function MyEarnings() {
  const [period, setPeriod] = useState<"month" | "lastMonth">("month");
  const query = useQueryMyEarnings(periodRange(period));
  const data = query.data?.data;

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 px-1">
        <h2 className="text-xs font-semibold text-foreground-muted">درآمد من</h2>
        <div className="flex gap-2">
          {(["month", "lastMonth"] as const).map((p) => (
            <button key={p} type="button" className={chip(period === p)} onClick={() => setPeriod(p)}>
              {PERIOD_LABEL[p]}
            </button>
          ))}
        </div>
      </div>
      {query.isLoading ? (
        <div className="h-24 animate-pulse rounded-[16px] bg-background-secondary" />
      ) : query.isError || !data ? (
        <p className="rounded-[16px] bg-background-secondary px-4 py-4 text-sm text-foreground-muted">
          درآمدی برای نمایش نیست.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
          <div className="px-4 py-4">
            <p className="text-xs text-foreground-muted">سهم من</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
              {formatToman(data.staffShare)} <span className="text-sm font-semibold text-foreground-muted">تومان</span>
            </p>
            <p className="mt-0.5 text-xs text-foreground-muted">از {formatToman(data.earned)} تومان کار انجام‌شده</p>
          </div>
          {data.payouts.map((p) => (
            <div key={p.publicId ?? p.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <span className="min-w-0">
                <span className="block text-sm text-foreground">
                  {shortDate(p.periodStart)} تا {shortDate(p.periodEnd)}
                </span>
                <span className="block text-xs text-foreground-muted">
                  {p.status === PAYOUT.Paid
                    ? `پرداخت شد${p.paidAt ? ` · ${shortDate(p.paidAt)}` : ""}`
                    : p.status === PAYOUT.Approved
                      ? "تأییدشده، منتظر پرداخت"
                      : "در حال بررسی"}
                </span>
              </span>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">{formatToman(p.totalAmount)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/** «من» — a staff member's own corner of the panel: their appointments, schedule and earnings. */
export default function MeView() {
  const D = RouteAddress.DASHBOARD;

  return (
    <DashboardPage className="gap-6">
      <DashboardPageHeader title="من" />

      <PanelListGroup>
        <PanelListRow href={D.MY_APPOINTMENTS} icon={CalendarCheckIcon} label="نوبت‌های من" />
        <PanelListRow href={D.SCHEDULES} icon={CalendarDotsIcon} label="برنامه‌ی کاری من" />
        <PanelListRow href={D.NOTIFICATIONS} icon={BellIcon} label="اعلان‌ها" />
      </PanelListGroup>

      <MyEarnings />
    </DashboardPage>
  );
}
