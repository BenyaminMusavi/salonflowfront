"use client";

import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import BottomSheet from "@/shared/components/composites/bottom-sheet/BottomSheet";
import { Button } from "@/shared/components/primitives/button/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/primitives/dialog/Dialog";
import payoutsService from "@/services/domains/payouts/payouts.service";
import {
  PAYOUTS_BY_STAFF_QUERY_KEY,
  useMutatePayouts,
  useQueryEarnings,
  useQueryPayoutOverview,
  useQueryPayoutPreview,
} from "@/services/domains/payouts/hooks";
import type { IPayout, IPayoutOverviewRow } from "@/services/domains/payouts/types/payouts.type";
import { PaymentMethod } from "@/services/common/enums/domain-enums";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { RouteAddress } from "@/shared/data/routeAddress";
import { formatToman } from "@/shared/utils/salonDisplay";
import { formatSalonDate, salonTodayYmd } from "@/shared/utils/salonTime";
import { cn } from "@/shared/utils/className";
import { APP_LOCALE } from "@/shared/utils/locale";
import {
  DashboardDateField,
  DashboardPage,
  DashboardPageHeader,
  DashboardSkeleton,
  DashboardToast,
  type DashboardToastState,
} from "../_components";
import { dashboardQuietButtonClass } from "../_components/buttonClasses";
import { PERIOD_LABEL, periodRange } from "../_components/periods";
import { useSalonStaff } from "../_staff/useSalonStaff";
import { CommissionPlans } from "./CommissionPlans";

const EARNING = { Pending: 1, Approved: 2, Paid: 3 };
const PAYOUT = { Draft: 1, Approved: 2, Paid: 3 };
const PAY_METHODS = [
  { value: PaymentMethod.Transfer, label: "انتقال" },
  { value: PaymentMethod.Cash, label: "نقد" },
  { value: PaymentMethod.Card, label: "کارت" },
];

const chip = (active: boolean) =>
  cn(
    "flex-1 rounded-full py-2 text-sm font-semibold transition-colors",
    active ? "bg-primary text-primary-foreground" : "bg-surface-hover text-foreground-muted"
  );

const shortDate = (d?: string) => (d ? formatSalonDate(d, { day: "numeric", month: "long" }) : "");

const periodChip = (active: boolean) =>
  cn(
    "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
    active ? "bg-primary text-primary-foreground" : "bg-surface-hover text-foreground-muted"
  );

/**
 * «تسویه پرسنل» — per person: what they earned and still need approving, what is ready to
 * pay; payouts move draft → approved → paid. Commission plans decide the share.
 */
export default function PayoutsView() {
  const salonId = useSalonContextStore((s) => s.salonId);
  const { members } = useSalonStaff();
  const [period, setPeriod] = useState<"month" | "lastMonth">("month");
  const periodDates = periodRange(period);
  const overview = useQueryPayoutOverview(periodDates);
  const rowsAll = useMemo(() => overview.data?.data ?? [], [overview.data]);
  // Only waiting earnings are listed one by one — «تأیید همه» needs their ids.
  const pendingQuery = useQueryEarnings({ status: EARNING.Pending, pageSize: 100 });
  const pendingEarnings = useMemo(() => pendingQuery.data?.data?.items ?? [], [pendingQuery.data]);
  const mutate = useMutatePayouts();
  const [toast, setToast] = useState<DashboardToastState>(null);
  const [payoutFor, setPayoutFor] = useState<IPayoutOverviewRow | null>(null);
  const [range, setRange] = useState(() => periodRange("month"));
  const preview = useQueryPayoutPreview(
    payoutFor ? { staffPublicId: payoutFor.staff.publicId, from: range.from, to: range.to } : null
  );
  const previewData = preview.data?.data;
  const [markPaid, setMarkPaid] = useState<IPayout | null>(null);
  const [method, setMethod] = useState<number>(PaymentMethod.Transfer);
  const [approving, setApproving] = useState<number | null>(null);

  const payoutQueries = useQueries({
    queries: rowsAll.map((r) => r.staff).map((m) => ({
      queryKey: [PAYOUTS_BY_STAFF_QUERY_KEY, salonId, m.staffMemberId],
      queryFn: () => payoutsService.getPayoutsByStaff(m.staffMemberId!),
      enabled: !!salonId,
    })),
  });
  const payouts = payoutQueries
    .flatMap((q) => q.data?.data ?? [])
    .sort((a, b) => String(b.periodEnd ?? "").localeCompare(String(a.periodEnd ?? "")));

  const byPerson = useMemo(
    () =>
      rowsAll.map((row) => ({
        row,
        name: row.staff.fullName?.trim() || "پرسنل",
        pending: pendingEarnings.filter((e) => e.staffMemberId === row.staff.staffMemberId),
      })),
    [rowsAll, pendingEarnings]
  );
  const nameOf = (id: number) =>
    rowsAll.find((r) => r.staff.staffMemberId === id)?.staff.fullName?.trim() || "پرسنل";

  const approveAll = async (staffMemberId: number, ids: number[]) => {
    setApproving(staffMemberId);
    try {
      for (const id of ids) await mutate.approveEarning.mutateAsync(id);
      setToast({ type: "success", message: "درآمدها تأیید شد." });
    } catch (err) {
      setToast({ type: "error", message: getApiErrorMessage(err, "تأیید ناموفق بود.") });
    } finally {
      setApproving(null);
    }
  };

  const createPayout = async () => {
    if (!payoutFor || !previewData?.amount) return;
    try {
      // The preview's own bounds make the payout group exactly the earnings it showed.
      await mutate.createPayout.mutateAsync({
        staffMemberId: payoutFor.staff.staffMemberId,
        periodStart: previewData.periodStart,
        periodEnd: previewData.periodEnd,
        approve: true,
      });
      setPayoutFor(null);
      setToast({ type: "success", message: "تسویه ثبت و تأیید شد. بعد از پرداخت، «پرداخت شد» را بزنید." });
    } catch (err) {
      setToast({ type: "error", message: getApiErrorMessage(err, "ثبت تسویه ناموفق بود.") });
    }
  };

  const confirmPaid = async () => {
    if (!markPaid) return;
    try {
      await mutate.markPaid.mutateAsync({ id: markPaid.id, method });
      setToast({ type: "success", message: "پرداخت تسویه ثبت شد." });
    } catch (err) {
      setToast({ type: "error", message: getApiErrorMessage(err, "ثبت ناموفق بود.") });
    }
    setMarkPaid(null);
  };

  return (
    <DashboardPage className="gap-5">
      <DashboardPageHeader title="تسویه پرسنل" backHref={RouteAddress.DASHBOARD.FINANCE} />

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 px-1">
          <h2 className="text-xs font-semibold text-foreground-muted">سهم پرسنل</h2>
          <div className="flex gap-2">
            {(["month", "lastMonth"] as const).map((p) => (
              <button key={p} type="button" className={periodChip(period === p)} onClick={() => setPeriod(p)}>
                {PERIOD_LABEL[p]}
              </button>
            ))}
          </div>
        </div>
        {overview.isLoading ? (
          <DashboardSkeleton cards={1} rows={3} />
        ) : overview.isError ? (
          <p className="text-sm text-error">{getApiErrorMessage(overview.error, "دریافت سهم پرسنل ناموفق بود.")}</p>
        ) : rowsAll.length === 0 ? (
          <p className="rounded-[16px] bg-background-secondary px-4 py-4 text-sm text-foreground-muted">پرسنل فعالی نیست.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
            {byPerson.map(({ row, name, pending }) => (
              <div key={row.staff.publicId} className="flex flex-col gap-2 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-semibold text-foreground">{name}</span>
                  <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">
                    {formatToman(row.readyAmount)} تومان
                  </span>
                </div>
                <p className="text-xs leading-5 text-foreground-muted">
                  آماده‌ی تسویه · سهم {PERIOD_LABEL[period]} {formatToman(row.staffShare)} تومان از {formatToman(row.earned)} تومان کار
                  {row.pendingCount ? ` · ${row.pendingCount.toLocaleString(APP_LOCALE)} خدمت منتظر تأیید` : ""}
                  {row.lastPayoutAt ? ` · آخرین تسویه ${shortDate(row.lastPayoutAt)}` : ""}
                </p>
                <div className="flex gap-2">
                  {pending.length ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className={cn(dashboardQuietButtonClass, "rounded-[12px]")}
                      isLoading={approving === row.staff.staffMemberId}
                      onClick={() => void approveAll(row.staff.staffMemberId, pending.map((e) => e.id))}
                    >
                      تأیید همه
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-[12px]"
                    disabled={!row.readyAmount}
                    onClick={() => {
                      setRange(periodDates);
                      setPayoutFor(row);
                    }}
                  >
                    ثبت تسویه
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="px-1 text-xs font-semibold text-foreground-muted">تسویه‌ها</h2>
        {payouts.length === 0 ? (
          <p className="rounded-[16px] bg-background-secondary px-4 py-4 text-sm text-foreground-muted">هنوز تسویه‌ای ثبت نشده.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
            {payouts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {nameOf(p.staffMemberId)} · {formatToman(p.totalAmount ?? 0)} تومان
                  </span>
                  <span className="block truncate text-xs text-foreground-muted">
                    {shortDate(p.periodStart)} تا {shortDate(p.periodEnd)} ·{" "}
                    {p.status === PAYOUT.Paid ? "پرداخت شد" : p.status === PAYOUT.Approved ? "تأییدشده، منتظر پرداخت" : "پیش‌نویس"}
                  </span>
                </span>
                {p.status === PAYOUT.Paid ? null : p.status === PAYOUT.Approved ? (
                  <Button type="button" size="sm" className="shrink-0 rounded-[12px]" onClick={() => setMarkPaid(p)}>
                    پرداخت شد
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className={cn(dashboardQuietButtonClass, "shrink-0 rounded-[12px]")}
                    isLoading={mutate.approvePayout.isPending}
                    onClick={() =>
                      mutate.approvePayout.mutate(p.id, {
                        onError: (err) => setToast({ type: "error", message: getApiErrorMessage(err, "تأیید ناموفق بود.") }),
                      })
                    }
                  >
                    تأیید
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <CommissionPlans staff={members} onToast={setToast} />

      <BottomSheet open={!!payoutFor} onClose={() => setPayoutFor(null)}>
        {payoutFor ? (
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-foreground">تسویه با {payoutFor.staff.fullName?.trim() || "پرسنل"}</h3>
            <p className="text-xs leading-5 text-foreground-muted">
              سهم‌های تأییدشده‌ی این بازه در یک تسویه جمع و همان‌جا تأیید می‌شوند.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <DashboardDateField name="payout-from" label="از" value={range.from} onChange={(from) => from && setRange((r) => ({ ...r, from }))} />
              <DashboardDateField name="payout-to" label="تا" value={range.to} onChange={(to) => to && setRange((r) => ({ ...r, to: to > salonTodayYmd() ? salonTodayYmd() : to }))} />
            </div>
            <div className="rounded-[12px] bg-background-secondary px-4 py-3 text-sm">
              {range.from > range.to ? (
                <span className="text-error">تاریخ پایان باید بعد از شروع باشد.</span>
              ) : preview.isLoading ? (
                <span className="text-foreground-muted">در حال محاسبه…</span>
              ) : previewData?.amount ? (
                <span className="text-foreground">
                  <span className="font-bold tabular-nums">{formatToman(previewData.amount)} تومان</span>
                  <span className="text-foreground-muted"> · {previewData.count.toLocaleString(APP_LOCALE)} خدمت</span>
                </span>
              ) : (
                <span className="text-foreground-muted">در این بازه سهم تأییدشده‌ی تسویه‌نشده‌ای نیست.</span>
              )}
            </div>
            <Button
              type="button"
              className="w-full rounded-[12px]"
              disabled={!previewData?.amount || range.from > range.to}
              isLoading={mutate.createPayout.isPending}
              onClick={() => void createPayout()}
            >
              {previewData?.amount ? `ثبت و تأیید ${formatToman(previewData.amount)} تومان` : "ثبت تسویه"}
            </Button>
          </div>
        ) : null}
      </BottomSheet>

      <Dialog open={!!markPaid} onOpenChange={(o) => !o && setMarkPaid(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              پرداخت {formatToman(markPaid?.totalAmount ?? 0)} تومان به {markPaid ? nameOf(markPaid.staffMemberId) : ""}؟
            </DialogTitle>
            <DialogDescription>بعد از ثبت، این تسویه بسته می‌شود.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 rounded-full bg-background-secondary p-1">
            {PAY_METHODS.map((m) => (
              <button key={m.value} type="button" className={chip(method === m.value)} onClick={() => setMethod(m.value)}>
                {m.label}
              </button>
            ))}
          </div>
          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" className={dashboardQuietButtonClass} onClick={() => setMarkPaid(null)}>انصراف</Button>
            <Button type="button" isLoading={mutate.markPaid.isPending} onClick={() => void confirmPaid()}>ثبت پرداخت</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DashboardToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardPage>
  );
}
