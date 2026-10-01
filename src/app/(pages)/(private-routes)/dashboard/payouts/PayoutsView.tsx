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
} from "@/services/domains/payouts/hooks";
import type { IPayout } from "@/services/domains/payouts/types/payouts.type";
import { PaymentMethod } from "@/services/common/enums/domain-enums";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { RouteAddress } from "@/shared/data/routeAddress";
import { formatToman } from "@/shared/utils/salonDisplay";
import { formatSalonDate, salonTodayYmd } from "@/shared/utils/salonTime";
import { cn } from "@/shared/utils/className";
import {
  DashboardDateField,
  DashboardPage,
  DashboardPageHeader,
  DashboardSkeleton,
  DashboardToast,
  type DashboardToastState,
} from "../_components";
import { dashboardQuietButtonClass } from "../_components/buttonClasses";
import { periodRange } from "../_components/periods";
import { useSalonStaff, type ISalonStaffMember } from "../_staff/useSalonStaff";
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

/**
 * «تسویه پرسنل» — per person: what they earned and still need approving, what is ready to
 * pay; payouts move draft → approved → paid. Commission plans decide the share.
 */
export default function PayoutsView() {
  const salonId = useSalonContextStore((s) => s.salonId);
  const { members } = useSalonStaff();
  const people = members.filter((m) => m.staffMemberId != null);
  const earningsQuery = useQueryEarnings({ pageSize: 100 });
  const earnings = earningsQuery.data?.data?.items ?? [];
  const mutate = useMutatePayouts();
  const [toast, setToast] = useState<DashboardToastState>(null);
  const [payoutFor, setPayoutFor] = useState<ISalonStaffMember | null>(null);
  const [range, setRange] = useState(() => periodRange("month"));
  const [markPaid, setMarkPaid] = useState<IPayout | null>(null);
  const [method, setMethod] = useState<number>(PaymentMethod.Transfer);
  const [approving, setApproving] = useState<number | null>(null);

  const payoutQueries = useQueries({
    queries: people.map((m) => ({
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
      people.map((m) => {
        const mine = earnings.filter((e) => e.staffMemberId === m.staffMemberId);
        const sum = (status: number) =>
          mine.filter((e) => e.status === status).reduce((s, e) => s + (e.commissionAmount || 0), 0);
        return {
          member: m,
          pending: mine.filter((e) => e.status === EARNING.Pending),
          pendingAmount: sum(EARNING.Pending),
          readyAmount: sum(EARNING.Approved),
        };
      }),
    [people, earnings]
  );
  const nameOf = (id: number) => people.find((p) => p.staffMemberId === id)?.name ?? "پرسنل";

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
    if (!payoutFor?.staffMemberId || range.from > range.to) return;
    try {
      await mutate.createPayout.mutateAsync({
        staffMemberId: payoutFor.staffMemberId,
        periodStart: range.from,
        periodEnd: range.to,
      });
      setPayoutFor(null);
      setToast({ type: "success", message: "تسویه ثبت شد. بعد از بررسی، آن را تأیید کنید." });
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
        <h2 className="px-1 text-xs font-semibold text-foreground-muted">سهم پرسنل</h2>
        {earningsQuery.isLoading ? (
          <DashboardSkeleton cards={1} rows={3} />
        ) : people.length === 0 ? (
          <p className="rounded-[16px] bg-background-secondary px-4 py-4 text-sm text-foreground-muted">پرسنل فعالی نیست.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
            {byPerson.map(({ member, pending, pendingAmount, readyAmount }) => (
              <div key={member.publicId} className="flex flex-col gap-2 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-semibold text-foreground">{member.name}</span>
                  <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">
                    {formatToman(readyAmount)} تومان
                  </span>
                </div>
                <p className="text-xs text-foreground-muted">
                  آماده‌ی تسویه{pendingAmount ? ` · ${formatToman(pendingAmount)} تومان منتظر تأیید (${pending.length} خدمت)` : ""}
                </p>
                <div className="flex gap-2">
                  {pending.length ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className={cn(dashboardQuietButtonClass, "rounded-[12px]")}
                      isLoading={approving === member.staffMemberId}
                      onClick={() => void approveAll(member.staffMemberId!, pending.map((e) => e.id))}
                    >
                      تأیید همه
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-[12px]"
                    onClick={() => {
                      setRange(periodRange("month"));
                      setPayoutFor(member);
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
            <h3 className="text-base font-bold text-foreground">تسویه با {payoutFor.name}</h3>
            <p className="text-xs leading-5 text-foreground-muted">
              سهم‌های تأییدشده‌ی این بازه در یک تسویه جمع می‌شوند.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <DashboardDateField name="payout-from" label="از" value={range.from} onChange={(from) => from && setRange((r) => ({ ...r, from }))} />
              <DashboardDateField name="payout-to" label="تا" value={range.to} onChange={(to) => to && setRange((r) => ({ ...r, to: to > salonTodayYmd() ? salonTodayYmd() : to }))} />
            </div>
            <Button type="button" className="w-full rounded-[12px]" disabled={range.from > range.to} isLoading={mutate.createPayout.isPending} onClick={() => void createPayout()}>
              ثبت تسویه
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
