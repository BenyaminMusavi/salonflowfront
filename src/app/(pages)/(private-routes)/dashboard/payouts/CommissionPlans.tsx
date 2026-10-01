"use client";

import { useState } from "react";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import BottomSheet from "@/shared/components/composites/bottom-sheet/BottomSheet";
import { Button } from "@/shared/components/primitives/button/Button";
import { Checkbox } from "@/shared/components/primitives/checkbox/Checkbox";
import { Input } from "@/shared/components/primitives/input/Input";
import { MoneyInput } from "@/shared/components/primitives/input/MoneyInput";
import { Switch } from "@/shared/components/primitives/switch/Switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/primitives/dialog/Dialog";
import { useMutateCommission, useQueryCommissionPlans } from "@/services/domains/commission/hooks";
import {
  CommissionCalculationType,
  CommissionScope,
  type ICommissionPlan,
  type ICommissionRule,
} from "@/services/domains/commission/types/commission.type";
import { useQueryCatalogOfferings } from "@/services/domains/catalog/hooks";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { formatToman } from "@/shared/utils/salonDisplay";
import { cn } from "@/shared/utils/className";
import { DashboardSelect } from "../_components/DashboardSelect";
import type { DashboardToastState } from "../_components/DashboardToast";
import { dashboardQuietButtonClass } from "../_components/buttonClasses";
import type { ISalonStaffMember } from "../_staff/useSalonStaff";

const chip = (active: boolean) =>
  cn(
    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
    active ? "bg-primary text-primary-foreground" : "bg-surface-hover text-foreground-muted"
  );

type Confirm = { kind: "plan"; plan: ICommissionPlan } | { kind: "rule"; planId: number; rule: ICommissionRule; label: string } | null;

/**
 * «طرح کمیسیون» — a real form instead of raw JSON: a plan has a default share for everyone and
 * optional exceptions for one service or one person (percentage or a fixed amount).
 */
export function CommissionPlans({
  staff,
  onToast,
}: {
  staff: ISalonStaffMember[];
  onToast: (t: DashboardToastState) => void;
}) {
  const plans = useQueryCommissionPlans().data?.data ?? [];
  const mutate = useMutateCommission();
  const offerings = useQueryCatalogOfferings(true).data?.data ?? [];
  const serviceTypes = Array.from(new Map(offerings.map((o) => [o.serviceTypeId, o.serviceTypeName])).entries());

  const [openId, setOpenId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [confirm, setConfirm] = useState<Confirm>(null);

  const [scope, setScope] = useState<CommissionScope>(CommissionScope.SalonDefault);
  const [targetId, setTargetId] = useState<number | "">("");
  const [calc, setCalc] = useState<CommissionCalculationType>(CommissionCalculationType.Percentage);
  const [value, setValue] = useState<number | null>(null);
  const [tips, setTips] = useState(false);

  const open = plans.find((p) => p.id === openId) ?? null;

  const ruleLabel = (r: ICommissionRule) => {
    const who =
      r.scope === CommissionScope.Staff
        ? staff.find((s) => s.staffMemberId === r.staffMemberId)?.name ?? "یک نفر"
        : r.scope === CommissionScope.ServiceType
          ? serviceTypes.find(([id]) => id === r.serviceTypeId)?.[1] ?? "یک خدمت"
          : "همه";
    const amount =
      r.calculationType === CommissionCalculationType.Fixed ? `${formatToman(r.value)} تومان` : `${r.value}٪`;
    return { who, amount };
  };

  const createPlan = async () => {
    if (!newName.trim()) return;
    try {
      await mutate.createPlan.mutateAsync({ name: newName.trim() });
      setCreating(false);
      setNewName("");
      onToast({ type: "success", message: "طرح ساخته شد. حالا سهم پرسنل را در آن تعیین کنید." });
    } catch (err) {
      onToast({ type: "error", message: getApiErrorMessage(err, "ساخت طرح ناموفق بود.") });
    }
  };

  const toggleActive = async (plan: ICommissionPlan, isActive: boolean) => {
    try {
      await mutate.updatePlan.mutateAsync({ id: plan.id, body: { name: plan.name, isActive } });
    } catch (err) {
      onToast({ type: "error", message: getApiErrorMessage(err, "ذخیره ناموفق بود.") });
    }
  };

  const addRule = async () => {
    if (!open) return;
    if (value == null || value <= 0) return onToast({ type: "error", message: "مقدار سهم را وارد کنید." });
    if (calc === CommissionCalculationType.Percentage && value > 100)
      return onToast({ type: "error", message: "درصد نمی‌تواند بیشتر از 100 باشد." });
    if (scope !== CommissionScope.SalonDefault && !targetId)
      return onToast({ type: "error", message: scope === CommissionScope.Staff ? "پرسنل را انتخاب کنید." : "خدمت را انتخاب کنید." });
    try {
      await mutate.createRule.mutateAsync({
        planId: open.id,
        body: {
          scope,
          calculationType: calc,
          value,
          appliesToTips: tips,
          staffMemberId: scope === CommissionScope.Staff ? Number(targetId) : null,
          serviceTypeId: scope === CommissionScope.ServiceType ? Number(targetId) : null,
        },
      });
      setValue(null);
      setTargetId("");
      onToast({ type: "success", message: "سهم ثبت شد." });
    } catch (err) {
      onToast({ type: "error", message: getApiErrorMessage(err, "ثبت سهم ناموفق بود.") });
    }
  };

  const doConfirm = async () => {
    if (!confirm) return;
    try {
      if (confirm.kind === "plan") {
        await mutate.deletePlan.mutateAsync(confirm.plan.id);
        setOpenId(null);
      } else {
        await mutate.deleteRule.mutateAsync({ planId: confirm.planId, ruleId: confirm.rule.id });
      }
      onToast({ type: "success", message: "حذف شد." });
    } catch (err) {
      onToast({ type: "error", message: getApiErrorMessage(err, "حذف ناموفق بود.") });
    }
    setConfirm(null);
  };

  const bookable = staff.filter((s) => s.staffMemberId != null);

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-semibold text-foreground-muted">طرح کمیسیون (سهم پرسنل)</h2>
        <button type="button" onClick={() => setCreating(true)} className="flex items-center gap-1 text-xs font-semibold text-primary">
          <PlusIcon size={14} weight="bold" />
          طرح جدید
        </button>
      </div>
      {plans.length === 0 ? (
        <p className="rounded-[16px] bg-background-secondary px-4 py-4 text-xs leading-5 text-foreground-muted">
          هنوز طرحی نیست. با یک طرح مشخص کنید از هر خدمت چه سهمی به پرسنل می‌رسد.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
          {plans.map((p) => {
            const def = p.rules.find((r) => r.scope === CommissionScope.SalonDefault);
            return (
              <button key={p.id} type="button" onClick={() => setOpenId(p.id)} className="flex items-center gap-3 px-4 py-3 text-right hover:bg-surface-hover">
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate text-sm font-semibold", p.isActive ? "text-foreground" : "text-foreground-muted")}>{p.name}</span>
                  <span className="block truncate text-xs text-foreground-muted">
                    {def ? `پیش‌فرض ${ruleLabel(def).amount}` : "بدون سهم پیش‌فرض"}
                    {p.rules.length > (def ? 1 : 0) ? ` · ${p.rules.length - (def ? 1 : 0)} استثنا` : ""}
                    {p.isActive ? "" : " · غیرفعال"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <BottomSheet open={creating} onClose={() => setCreating(false)}>
        <div className="flex flex-col gap-4">
          <h3 className="text-base font-bold text-foreground">طرح جدید</h3>
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="مثلاً طرح پایه" className="rounded-[12px]" autoFocus />
          <Button type="button" className="w-full rounded-[12px]" disabled={!newName.trim()} isLoading={mutate.createPlan.isPending} onClick={() => void createPlan()}>
            ساخت طرح
          </Button>
        </div>
      </BottomSheet>

      <BottomSheet open={!!open} onClose={() => setOpenId(null)}>
        {open ? (
          <div className="flex max-h-[75vh] flex-col gap-4 overflow-y-auto pb-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-bold text-foreground">{open.name}</h3>
              <label className="flex items-center gap-2 text-xs text-foreground-muted">
                فعال
                <Switch checked={open.isActive} onCheckedChange={(v) => void toggleActive(open, v)} />
              </label>
            </div>

            {open.rules.length > 0 ? (
              <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
                {open.rules.map((r) => {
                  const { who, amount } = ruleLabel(r);
                  return (
                    <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-foreground">{who}</span>
                        <span className="block text-xs text-foreground-muted">
                          سهم {amount}
                          {r.appliesToTips ? " · شامل انعام" : ""}
                        </span>
                      </span>
                      <button
                        type="button"
                        aria-label="حذف سهم"
                        onClick={() => setConfirm({ kind: "rule", planId: open.id, rule: r, label: `${who} · ${amount}` })}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-hover"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-foreground-muted">هنوز سهمی تعریف نشده.</p>
            )}

            <div className="flex flex-col gap-3 rounded-[16px] bg-background-secondary p-4">
              <p className="text-xs font-semibold text-foreground-muted">افزودن سهم</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={chip(scope === CommissionScope.SalonDefault)} onClick={() => setScope(CommissionScope.SalonDefault)}>همه (پیش‌فرض)</button>
                <button type="button" className={chip(scope === CommissionScope.ServiceType)} onClick={() => { setScope(CommissionScope.ServiceType); setTargetId(""); }}>یک خدمت</button>
                <button type="button" className={chip(scope === CommissionScope.Staff)} onClick={() => { setScope(CommissionScope.Staff); setTargetId(""); }}>یک نفر</button>
              </div>
              {scope === CommissionScope.ServiceType ? (
                <DashboardSelect value={targetId} onChange={(e) => setTargetId(Number(e.target.value) || "")}>
                  <option value="">انتخاب خدمت</option>
                  {serviceTypes.map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </DashboardSelect>
              ) : scope === CommissionScope.Staff ? (
                <DashboardSelect value={targetId} onChange={(e) => setTargetId(Number(e.target.value) || "")}>
                  <option value="">انتخاب پرسنل</option>
                  {bookable.map((s) => (
                    <option key={s.publicId} value={s.staffMemberId!}>{s.name}</option>
                  ))}
                </DashboardSelect>
              ) : null}
              <div className="flex gap-2">
                <button type="button" className={chip(calc === CommissionCalculationType.Percentage)} onClick={() => setCalc(CommissionCalculationType.Percentage)}>درصد</button>
                <button type="button" className={chip(calc === CommissionCalculationType.Fixed)} onClick={() => setCalc(CommissionCalculationType.Fixed)}>مبلغ ثابت هر خدمت</button>
              </div>
              {calc === CommissionCalculationType.Percentage ? (
                <Input
                  inputMode="numeric"
                  dir="ltr"
                  placeholder="مثلاً 40"
                  value={value ?? ""}
                  onChange={(e) => setValue(e.target.value === "" ? null : Number(e.target.value.replace(/[^\d.]/g, "")))}
                  className="rounded-[12px]"
                  endIcon={<span className="text-xs text-foreground-muted">٪</span>}
                />
              ) : (
                <MoneyInput value={value} onValueChange={setValue} placeholder="مبلغ" className="rounded-[12px]" />
              )}
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox checked={tips} onCheckedChange={(v) => setTips(v === true)} />
                شامل انعام هم بشود
              </label>
              <Button type="button" size="sm" className="self-start rounded-[12px]" isLoading={mutate.createRule.isPending} onClick={() => void addRule()}>
                ثبت سهم
              </Button>
            </div>

            <button type="button" onClick={() => setConfirm({ kind: "plan", plan: open })} className="text-sm font-semibold text-error">
              حذف این طرح
            </button>
          </div>
        ) : null}
      </BottomSheet>

      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirm?.kind === "plan" ? `حذف طرح «${confirm.plan.name}»؟` : "حذف این سهم؟"}</DialogTitle>
            <DialogDescription>
              {confirm?.kind === "plan" ? "درآمدهایی که قبلاً حساب شده‌اند تغییر نمی‌کنند." : confirm?.label}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" className={dashboardQuietButtonClass} onClick={() => setConfirm(null)}>انصراف</Button>
            <Button type="button" variant="ghost" className="text-error hover:bg-error-background" isLoading={mutate.deletePlan.isPending || mutate.deleteRule.isPending} onClick={() => void doConfirm()}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
