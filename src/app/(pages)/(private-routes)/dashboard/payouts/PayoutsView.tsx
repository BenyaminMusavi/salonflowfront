"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/shared/components/primitives/button/Button";
import { formatToman } from "@/shared/utils/salonDisplay";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { useQueryCatalogOfferings } from "@/services/domains/catalog/hooks";
import { useQueryStaffForOfferings } from "@/services/domains/staff-profile/hooks";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useMutatePayouts, useQueryEarnings, useQueryPayoutsByStaff } from "@/services/domains/payouts/hooks";
import { useMutateCommission, useQueryCommissionPlans } from "@/services/domains/commission/hooks";
import { PaymentMethod } from "@/services/common/enums/domain-enums";
import {
  DashboardAdvanced,
  DashboardCard,
  DashboardDateField,
  DashboardEmptyState,
  DashboardPage,
  DashboardPageHeader,
  DashboardSelect,
  DashboardStatusChip,
  DashboardToast,
  type DashboardToastState,
} from "../_components";
import { dashboardQuietButtonClass } from "../_components/buttonClasses";

function staffLabel(member: { staffMemberId: number; firstName?: string | null }) {
  return member.firstName || `پرسنل #${member.staffMemberId}`;
}

function earningStatus(status: number): { label: string; className: string } {
  switch (status) {
    case 2:
      return { label: "تأیید شده", className: "bg-success-background text-success" };
    case 3:
      return { label: "پرداخت‌شده", className: "bg-primary/15 text-primary" };
    default:
      return { label: "در انتظار", className: "bg-warning-background text-warning" };
  }
}

function payoutStatus(status?: number): { label: string; className: string } {
  switch (status) {
    case 2:
      return { label: "تأیید شده", className: "bg-success-background text-success" };
    case 3:
      return { label: "پرداخت‌شده", className: "bg-primary/15 text-primary" };
    default:
      return { label: "پیش‌نویس", className: "bg-warning-background text-warning" };
  }
}

export default function PayoutsView() {
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const [toast, setToast] = useState<DashboardToastState>(null);

  const earningsQuery = useQueryEarnings({ pageSize: 50 });
  const earnings = earningsQuery.data?.data?.items ?? [];
  const payoutsMutate = useMutatePayouts();

  const offerings = useQueryCatalogOfferings(true).data?.data ?? [];
  const staff =
    useQueryStaffForOfferings(
      salonPublicId || undefined,
      offerings.map((o) => o.publicId),
      { enabled: offerings.length > 0 }
    ).data?.data ?? [];

  const [staffMemberId, setStaffMemberId] = useState<number | "">("");
  const selectedStaffId = staffMemberId ? Number(staffMemberId) : undefined;
  const payoutsByStaff = useQueryPayoutsByStaff(selectedStaffId).data?.data ?? [];

  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  const commissionPlansQuery = useQueryCommissionPlans();
  const commissionPlans = commissionPlansQuery.data?.data ?? [];
  const commissionMutate = useMutateCommission();
  const [planJson, setPlanJson] = useState(JSON.stringify({ name: "طرح جدید" }, null, 2));

  const staffNameById = useMemo(
    () => new Map(staff.map((s) => [s.staffMemberId, staffLabel(s)])),
    [staff]
  );

  const onCreatePayout = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId || !periodStart || !periodEnd) {
      setToast({
        type: "error",
        message: "پرسنل و بازه زمانی برای ایجاد تسویه الزامی است.",
      });
      return;
    }
    try {
      await payoutsMutate.createPayout.mutateAsync({
        staffMemberId: selectedStaffId,
        periodStart,
        periodEnd,
      });
      setToast({ type: "success", message: "درخواست تسویه ایجاد شد." });
    } catch (err) {
      setToast({
        type: "error",
        message: getApiErrorMessage(err, "ایجاد تسویه ناموفق بود."),
      });
    }
  };

  const onCreatePlan = async () => {
    try {
      await commissionMutate.createPlan.mutateAsync(
        JSON.parse(planJson) as Record<string, unknown>
      );
      setToast({ type: "success", message: "پلن کمیسیون ایجاد شد." });
    } catch (err) {
      setToast({
        type: "error",
        message: getApiErrorMessage(err, "ایجاد پلن کمیسیون ناموفق بود."),
      });
    }
  };

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="تسویه"
        description="درآمد پرسنل، درخواست تسویه و طرح کمیسیون."
      />

      <DashboardCard>
        <h2 className="mb-3 text-sm font-bold text-foreground">درآمدها</h2>
        <div className="space-y-2">
          {earnings.map((e) => {
            const chip = earningStatus(e.status);
            return (
              <div key={e.id} className="rounded-[12px] border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {staffNameById.get(e.staffMemberId) || `پرسنل #${e.staffMemberId}`}
                  </p>
                  <DashboardStatusChip label={chip.label} className={chip.className} />
                </div>
                <p className="mt-1 text-xs text-foreground-muted">
                  ناخالص {formatToman(e.grossAmount)} · کمیسیون {formatToman(e.commissionAmount)}
                </p>
                {e.status === 1 ? (
                  <div className="mt-2">
                    <Button
                      size="sm"
                      onClick={() => payoutsMutate.approveEarning.mutate(e.id)}
                    >
                      تأیید درآمد
                    </Button>
                  </div>
                ) : null}
              </div>
            );
          })}
          {earnings.length === 0 ? (
            <p className="text-xs text-foreground-muted">درآمدی برای نمایش نیست.</p>
          ) : null}
        </div>
      </DashboardCard>

      <DashboardCard>
        <h2 className="mb-3 text-sm font-bold text-foreground">ایجاد تسویه</h2>
        <form className="grid grid-cols-1 gap-2" onSubmit={onCreatePayout}>
          <DashboardSelect
            value={staffMemberId}
            onChange={(e) => setStaffMemberId(Number(e.target.value))}
          >
            <option value="">انتخاب پرسنل</option>
            {staff.map((s) => (
              <option key={s.staffMemberId} value={s.staffMemberId}>
                {staffLabel(s)}
              </option>
            ))}
          </DashboardSelect>
          <DashboardDateField
            name="payout-start"
            value={periodStart}
            onChange={setPeriodStart}
            label="از"
          />
          <DashboardDateField
            name="payout-end"
            value={periodEnd}
            onChange={setPeriodEnd}
            label="تا"
          />
          <Button type="submit" isLoading={payoutsMutate.createPayout.isPending}>
            ایجاد تسویه
          </Button>
        </form>

        <div className="mt-3 space-y-2">
          {payoutsByStaff.map((p) => {
            const chip = payoutStatus(p.status);
            return (
              <div key={p.id} className="rounded-[12px] border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    تسویه #{p.id}
                  </p>
                  <DashboardStatusChip label={chip.label} className={chip.className} />
                </div>
                <p className="mt-1 text-xs text-foreground-muted">
                  {staffNameById.get(p.staffMemberId) || p.staffMemberId}
                  {p.totalAmount != null ? ` · ${formatToman(p.totalAmount)} تومان` : ""}
                </p>
                <div className="mt-2 flex gap-2">
                  {p.status === 1 || p.status == null ? (
                    <Button
                      size="sm"
                      onClick={() => payoutsMutate.approvePayout.mutate(p.id)}
                    >
                      تأیید
                    </Button>
                  ) : null}
                  {p.status === 2 ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className={dashboardQuietButtonClass}
                      onClick={() =>
                        payoutsMutate.markPaid.mutate({
                          id: p.id,
                          method: PaymentMethod.Transfer,
                        })
                      }
                    >
                      علامت پرداخت‌شده
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
          {selectedStaffId && payoutsByStaff.length === 0 ? (
            <DashboardEmptyState
              title="تسویه‌ای برای این پرسنل نیست"
              description="بازه را انتخاب کنید و درخواست جدید بسازید."
            />
          ) : null}
        </div>
      </DashboardCard>

      <DashboardAdvanced title="طرح‌های کمیسیون">
        <textarea
          className="min-h-28 w-full rounded-[2px] border border-input-border bg-input p-2 text-xs text-foreground"
          value={planJson}
          onChange={(e) => setPlanJson(e.target.value)}
        />
        <div className="mt-2">
          <Button
            size="sm"
            onClick={onCreatePlan}
            isLoading={commissionMutate.createPlan.isPending}
          >
            ایجاد پلن
          </Button>
        </div>
        <div className="mt-3 space-y-2">
          {commissionPlans.map((plan) => (
            <div key={plan.id} className="rounded-[12px] border border-border p-2 text-xs">
              <pre className="overflow-x-auto whitespace-pre-wrap text-foreground-muted">
                {JSON.stringify(plan, null, 2)}
              </pre>
              <Button
                className={`mt-2 ${dashboardQuietButtonClass}`}
                size="sm"
                variant="outline"
                onClick={() => commissionMutate.deletePlan.mutate(plan.id)}
              >
                حذف پلن
              </Button>
            </div>
          ))}
        </div>
      </DashboardAdvanced>

      <DashboardToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardPage>
  );
}
