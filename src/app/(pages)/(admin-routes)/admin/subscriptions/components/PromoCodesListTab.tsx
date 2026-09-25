"use client";

import { useState } from "react";
import { PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/shared/components/primitives/button/Button";
import { Badge } from "@/shared/components/primitives/badge/Badge";
import { useQuerySubscriptionPlans } from "@/services/domains/subscriptions/hooks/useQuerySubscriptionPlans";
import { useQueryAdminPromoCodes } from "@/services/domains/subscriptions/hooks/useQueryAdminPromoCodes";
import {
  useMutateActivatePromoCode,
  useMutateDeactivatePromoCode,
} from "@/services/domains/subscriptions/hooks/useMutatePromoCodeActions";
import { IPromoCode } from "@/services/domains/subscriptions/types/subscriptions.type";
import { formatDiscountValue } from "@/services/domains/subscriptions/utils/subscription-display";
import { AdminEmptyState } from "../../_components/AdminEmptyState";
import { PromoCodeFormDrawer } from "./PromoCodeFormDrawer";
import { APP_LOCALE } from "@/shared/utils/locale";

export function PromoCodesListTab() {
  const { data: plansRes } = useQuerySubscriptionPlans();
  const plans = plansRes?.data ?? [];
  const planName = (planId: number | null) =>
    planId == null ? "همهٔ پلن‌ها" : plans.find((p) => p.id === planId)?.name ?? `#${planId}`;

  const { data, isLoading, isError } = useQueryAdminPromoCodes();
  const items = data?.data ?? [];

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<IPromoCode | null>(null);

  const { mutateAsync: activate, isPending: isActivating } = useMutateActivatePromoCode();
  const { mutateAsync: deactivate, isPending: isDeactivating } = useMutateDeactivatePromoCode();
  const isToggling = isActivating || isDeactivating;

  const openCreate = () => {
    setEditTarget(null);
    setDrawerOpen(true);
  };
  const openEdit = (promo: IPromoCode) => {
    setEditTarget(promo);
    setDrawerOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate} className="gap-1">
          <PlusIcon size={16} weight="bold" />
          کد تخفیف جدید
        </Button>
      </div>

      {isError ? (
        <p className="rounded-xl border border-error-border bg-error-background px-4 py-3 text-xs font-medium text-error">
          دریافت لیست کدهای تخفیف با خطا مواجه شد.
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-right text-[13px]">
            <thead>
              <tr className="border-b border-border bg-background-secondary text-[11px] text-foreground-muted">
                <th className="px-4 py-3 font-semibold">کد</th>
                <th className="px-4 py-3 font-semibold">پلن</th>
                <th className="px-4 py-3 font-semibold">تخفیف</th>
                <th className="px-4 py-3 font-semibold">استفاده</th>
                <th className="px-4 py-3 font-semibold">وضعیت</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-border last:border-0">
                    <td className="px-4 py-3" colSpan={6}>
                      <div className="h-4 w-full animate-pulse rounded bg-background-secondary" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8">
                    <AdminEmptyState
                      title="هنوز کد تخفیفی ایجاد نشده"
                      description="با دکمهٔ «کد تخفیف جدید» یک کد قابل استفاده هنگام خرید اشتراک بسازید."
                    />
                  </td>
                </tr>
              ) : (
                items.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border text-foreground last:border-0 hover:bg-background-secondary"
                  >
                    <td className="px-4 py-3 font-medium" dir="ltr">
                      {p.code}
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">{planName(p.planId)}</td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {formatDiscountValue(p.discountType, p.discountValue)}
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {p.usedCount.toLocaleString(APP_LOCALE)}
                      {p.maxRedemptions != null
                        ? ` از ${p.maxRedemptions.toLocaleString(APP_LOCALE)}`
                        : ""}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={p.isActive ? "success" : "default"}>
                        {p.isActive ? "فعال" : "غیرفعال"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => openEdit(p)}>
                          ویرایش
                        </Button>
                        <Button
                          size="sm"
                          variant={p.isActive ? "destructive" : "default"}
                          isLoading={isToggling}
                          onClick={() => (p.isActive ? deactivate(p.id) : activate(p.id))}
                        >
                          {p.isActive ? "غیرفعال‌سازی" : "فعال‌سازی"}
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

      <PromoCodeFormDrawer
        open={drawerOpen}
        target={editTarget}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
