"use client";

import { useMemo, useState } from "react";
import { PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/shared/components/primitives/button/Button";
import { Badge } from "@/shared/components/primitives/badge/Badge";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/primitives/drawer/Drawer";
import {
  useMutateToggleAdminPlan,
  useQueryAdminSubscriptionPlans,
} from "@/services/domains/subscriptions/hooks/useAdminSubscriptionPlans";
import { IAdminSubscriptionPlan } from "@/services/domains/subscriptions/types/subscriptions.type";
import { formatRialAsToman } from "@/services/domains/subscriptions/utils/subscription-display";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { formatSalonDate } from "@/shared/utils/salonTime";
import { AdminEmptyState } from "../../_components/AdminEmptyState";
import { PlanFormDrawer } from "./PlanFormDrawer";
import { PlanDiscountDrawer } from "./PlanDiscountDrawer";

function DiscountCell({ plan }: { plan: IAdminSubscriptionPlan }) {
  const d = plan.discount;
  if (!d) return <span className="text-foreground-muted">—</span>;
  const timing = !d.isEffectiveNow
    ? `زمان‌بندی‌شده از ${formatSalonDate(d.startsAt, { day: "numeric", month: "long" })}`
    : d.remainingDays != null
      ? `${d.remainingDays} روز باقی مانده`
      : "بدون تاریخ پایان";
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-medium">
        {d.percent}٪ {d.name}
      </span>
      <span className="text-[11px] text-foreground-muted">
        قیمت نهایی: {formatRialAsToman(d.finalPrice)} تومان
      </span>
      <Badge variant={d.isEffectiveNow ? "success" : "warning"} className="w-fit">
        {timing}
      </Badge>
    </div>
  );
}

/** Admin plans: create/edit, activate/deactivate (never delete), one percentage discount each. */
export function PlansListTab() {
  const { data, isLoading, isError } = useQueryAdminSubscriptionPlans();
  const plans = useMemo(
    () =>
      [...(data?.data ?? [])].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.durationMonths - b.durationMonths
      ),
    [data?.data]
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<IAdminSubscriptionPlan | null>(null);
  const [discountTarget, setDiscountTarget] = useState<IAdminSubscriptionPlan | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<IAdminSubscriptionPlan | null>(null);
  const [toggleError, setToggleError] = useState("");

  const { mutateAsync: toggle, isPending: isToggling, variables } = useMutateToggleAdminPlan();

  const runToggle = async (plan: IAdminSubscriptionPlan, active: boolean) => {
    setToggleError("");
    try {
      await toggle({ planPublicId: plan.publicId, active });
      setDeactivateTarget(null);
    } catch (e) {
      setToggleError(getApiErrorMessage(e, "تغییر وضعیت طرح ناموفق بود."));
    }
  };

  const onToggleClick = (plan: IAdminSubscriptionPlan) => {
    if (!plan.isActive) return void runToggle(plan, true);
    // Warn before hiding a plan people are still subscribed to.
    if (plan.activeSubscriberCount > 0) return setDeactivateTarget(plan);
    void runToggle(plan, false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-foreground-muted">
          طرح غیرفعال از صفحه‌ی اشتراک حذف می‌شود؛ مشترک‌های فعلی تا پایان دوره‌شان اشتراک دارند.
        </p>
        <Button
          size="sm"
          onClick={() => {
            setEditTarget(null);
            setFormOpen(true);
          }}
          className="shrink-0 gap-1"
        >
          <PlusIcon size={16} weight="bold" />
          طرح جدید
        </Button>
      </div>

      {isError || toggleError ? (
        <p className="rounded-xl border border-error-border bg-error-background px-4 py-3 text-xs font-medium text-error">
          {toggleError || "دریافت لیست طرح‌ها با خطا مواجه شد."}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-right text-[13px]">
            <thead>
              <tr className="border-b border-border bg-background-secondary text-[11px] text-foreground-muted">
                <th className="px-4 py-3 font-semibold">نام</th>
                <th className="px-4 py-3 font-semibold">مدت</th>
                <th className="px-4 py-3 font-semibold">قیمت</th>
                <th className="px-4 py-3 font-semibold">تخفیف</th>
                <th className="px-4 py-3 font-semibold">مشترک فعال</th>
                <th className="px-4 py-3 font-semibold">وضعیت</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-border last:border-0">
                    <td className="px-4 py-3" colSpan={7}>
                      <div className="h-4 w-full animate-pulse rounded bg-background-secondary" />
                    </td>
                  </tr>
                ))
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8">
                    <AdminEmptyState
                      title="هنوز طرحی ساخته نشده"
                      description="با دکمه‌ی «طرح جدید» اولین طرح اشتراک را بسازید."
                    />
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr
                    key={plan.publicId}
                    className="border-b border-border align-top text-foreground last:border-0 hover:bg-background-secondary"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">{plan.name}</p>
                      {plan.description ? (
                        <p className="mt-0.5 text-[11px] text-foreground-muted">{plan.description}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">{plan.durationMonths} ماه</td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {formatRialAsToman(plan.price)} تومان
                    </td>
                    <td className="px-4 py-3">
                      <DiscountCell plan={plan} />
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">{plan.activeSubscriberCount}</td>
                    <td className="px-4 py-3">
                      <Badge variant={plan.isActive ? "success" : "default"}>
                        {plan.isActive ? "فعال" : "غیرفعال"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setEditTarget(plan);
                            setFormOpen(true);
                          }}
                        >
                          ویرایش
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setDiscountTarget(plan)}>
                          تخفیف
                        </Button>
                        <Button
                          size="sm"
                          variant={plan.isActive ? "destructive" : "default"}
                          isLoading={isToggling && variables?.planPublicId === plan.publicId}
                          onClick={() => onToggleClick(plan)}
                        >
                          {plan.isActive ? "غیرفعال‌سازی" : "فعال‌سازی"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PlanFormDrawer open={formOpen} target={editTarget} onClose={() => setFormOpen(false)} />
      <PlanDiscountDrawer plan={discountTarget} onClose={() => setDiscountTarget(null)} />

      <Drawer
        open={!!deactivateTarget}
        onOpenChange={(next) => !next && setDeactivateTarget(null)}
        direction="right"
      >
        <DrawerContent showHandle={false} className="w-full sm:max-w-sm">
          <DrawerHeader className="border-b border-border text-right">
            <DrawerTitle className="text-base">غیرفعال‌سازی «{deactivateTarget?.name}»</DrawerTitle>
            <DrawerDescription className="text-xs">
              این طرح {deactivateTarget?.activeSubscriberCount} مشترک فعال دارد. بعد از غیرفعال‌سازی،
              طرح دیگر قابل خرید نیست ولی مشترک‌های فعلی تا پایان دوره‌شان اشتراک دارند.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="border-t border-border">
            <div className="flex gap-2">
              <Button
                variant="destructive"
                className="flex-1"
                isLoading={isToggling}
                onClick={() => deactivateTarget && runToggle(deactivateTarget, false)}
              >
                غیرفعال‌سازی
              </Button>
              <Button
                variant="secondary"
                onClick={() => setDeactivateTarget(null)}
                disabled={isToggling}
              >
                انصراف
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
