"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/shared/components/primitives/button/Button";
import { Input } from "@/shared/components/primitives/input/Input";
import { formatToman } from "@/shared/utils/salonDisplay";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { useQueryCatalogOfferings } from "@/services/domains/catalog/hooks";
import { useQueryStaffForOfferings } from "@/services/domains/staff-profile/hooks";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useMutatePayouts, useQueryEarnings, useQueryPayoutsByStaff } from "@/services/domains/payouts/hooks";
import { useMutateCommission, useQueryCommissionPlans } from "@/services/domains/commission/hooks";
import { PaymentMethod } from "@/services/common/enums/domain-enums";

export default function PayoutsView() {
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const earningsQuery = useQueryEarnings({ pageSize: 50 });
  const earnings = earningsQuery.data?.data?.items ?? [];
  const payoutsMutate = useMutatePayouts();

  const offerings = useQueryCatalogOfferings(true).data?.data ?? [];
  const staff = useQueryStaffForOfferings(
    salonPublicId || undefined,
    offerings.map((o) => o.id),
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
    () =>
      new Map(
        staff.map((s) => [
          s.id,
          s.fullName || [s.firstName, s.lastName].filter(Boolean).join(" "),
        ])
      ),
    [staff]
  );

  const onCreatePayout = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!selectedStaffId || !periodStart || !periodEnd) {
      setError("پرسنل و بازه زمانی برای ایجاد تسویه الزامی است.");
      return;
    }
    try {
      await payoutsMutate.createPayout.mutateAsync({
        staffMemberId: selectedStaffId,
        periodStart,
        periodEnd,
      });
      setSuccess("درخواست تسویه ایجاد شد.");
    } catch (err) {
      setError(getApiErrorMessage(err, "ایجاد تسویه ناموفق بود."));
    }
  };

  const onCreatePlan = async () => {
    setError("");
    setSuccess("");
    try {
      await commissionMutate.createPlan.mutateAsync(
        JSON.parse(planJson) as Record<string, unknown>
      );
      setSuccess("پلن کمیسیون ایجاد شد.");
    } catch (err) {
      setError(getApiErrorMessage(err, "ایجاد پلن کمیسیون ناموفق بود."));
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-col gap-4 px-safe-area pb-8">
      <div className="rounded-lg bg-surface-secondary p-3">
        <h1 className="text-base font-bold text-foreground">تسویه و کمیسیون</h1>
        <p className="text-xs text-foreground-muted">
          فقط Owner ops پیاده‌سازی شده و بخش‌های Admin خارج از محدوده این SPA هستند.
        </p>
      </div>

      <div className="rounded-lg bg-surface-secondary p-3">
        <h2 className="mb-2 text-sm font-bold text-foreground">Earnings</h2>
        <div className="space-y-2">
          {earnings.map((e) => (
            <div key={e.id} className="rounded-md border border-border p-2">
              <p className="text-xs text-foreground-muted">
                پرسنل #{e.staffMemberId} | ناخالص {formatToman(e.grossAmount)} | کمیسیون{" "}
                {formatToman(e.commissionAmount)}
              </p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={() => payoutsMutate.approveEarning.mutate(e.id)}>
                  تایید درآمد
                </Button>
              </div>
            </div>
          ))}
          {earnings.length === 0 ? (
            <p className="text-xs text-foreground-muted">درآمدی برای نمایش وجود ندارد.</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-lg bg-surface-secondary p-3">
        <h2 className="mb-2 text-sm font-bold text-foreground">ساخت/مدیریت Payout</h2>
        <form className="grid grid-cols-1 gap-2" onSubmit={onCreatePayout}>
          <select
            className="h-12 rounded-[2px] bg-foreground/5 px-3 text-sm text-foreground"
            value={staffMemberId}
            onChange={(e) => setStaffMemberId(Number(e.target.value))}
          >
            <option value="">انتخاب پرسنل</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName || [s.firstName, s.lastName].filter(Boolean).join(" ")}
              </option>
            ))}
          </select>
          <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
          <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
          <Button type="submit" isLoading={payoutsMutate.createPayout.isPending}>
            ایجاد تسویه
          </Button>
        </form>

        <div className="mt-3 space-y-2">
          {payoutsByStaff.map((p) => (
            <div key={p.id} className="rounded-md border border-border p-2">
              <p className="text-xs text-foreground-muted">
                تسویه #{p.id} | پرسنل {staffNameById.get(p.staffMemberId) || p.staffMemberId}
              </p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={() => payoutsMutate.approvePayout.mutate(p.id)}>
                  تایید
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    payoutsMutate.markPaid.mutate({ id: p.id, method: PaymentMethod.Transfer })
                  }
                >
                  Mark Paid
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-surface-secondary p-3">
        <h2 className="mb-2 text-sm font-bold text-foreground">Commission Plans</h2>
        <textarea
          className="min-h-28 w-full rounded-[2px] bg-foreground/5 p-2 text-xs text-foreground"
          value={planJson}
          onChange={(e) => setPlanJson(e.target.value)}
        />
        <div className="mt-2">
          <Button size="sm" onClick={onCreatePlan} isLoading={commissionMutate.createPlan.isPending}>
            ایجاد پلن
          </Button>
        </div>
        <div className="mt-3 space-y-2">
          {commissionPlans.map((plan) => (
            <div key={plan.id} className="rounded-md border border-border p-2 text-xs">
              <pre className="overflow-x-auto whitespace-pre-wrap text-foreground-muted">
                {JSON.stringify(plan, null, 2)}
              </pre>
              <Button
                className="mt-2"
                size="sm"
                variant="outline"
                onClick={() => commissionMutate.deletePlan.mutate(plan.id)}
              >
                حذف پلن
              </Button>
            </div>
          ))}
        </div>
      </div>

      {error ? <p className="text-sm text-error">{error}</p> : null}
      {success ? <p className="text-sm text-primary">{success}</p> : null}
    </div>
  );
}

