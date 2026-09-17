"use client";

import { useState } from "react";
import { PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/shared/components/primitives/button/Button";
import { Badge } from "@/shared/components/primitives/badge/Badge";
import { useQuerySubscriptionPlans } from "@/services/domains/subscriptions/hooks/useQuerySubscriptionPlans";
import { useQueryAdminCampaigns } from "@/services/domains/subscriptions/hooks/useQueryAdminCampaigns";
import {
  useMutateActivateCampaign,
  useMutateDeactivateCampaign,
} from "@/services/domains/subscriptions/hooks/useMutateCampaignActions";
import { IPlanCampaign } from "@/services/domains/subscriptions/types/subscriptions.type";
import { formatDiscountValue } from "@/services/domains/subscriptions/utils/subscription-display";
import { formatAdminDate } from "@/services/domains/admin/utils/admin-salon-display";
import { AdminEmptyState } from "../../_components/AdminEmptyState";
import { CampaignFormDrawer } from "./CampaignFormDrawer";

export function CampaignsListTab() {
  const { data: plansRes } = useQuerySubscriptionPlans();
  const plans = plansRes?.data ?? [];
  const planName = (planId: number) => plans.find((p) => p.id === planId)?.name ?? `#${planId}`;

  const { data, isLoading, isError } = useQueryAdminCampaigns();
  const items = data?.data ?? [];

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<IPlanCampaign | null>(null);

  const { mutateAsync: activate, isPending: isActivating } = useMutateActivateCampaign();
  const { mutateAsync: deactivate, isPending: isDeactivating } = useMutateDeactivateCampaign();
  const isToggling = isActivating || isDeactivating;

  const openCreate = () => {
    setEditTarget(null);
    setDrawerOpen(true);
  };
  const openEdit = (campaign: IPlanCampaign) => {
    setEditTarget(campaign);
    setDrawerOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate} className="gap-1">
          <PlusIcon size={16} weight="bold" />
          کمپین جدید
        </Button>
      </div>

      {isError ? (
        <p className="rounded-xl border border-error-border bg-error-background px-4 py-3 text-xs font-medium text-error">
          دریافت لیست کمپین‌ها با خطا مواجه شد.
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-right text-[13px]">
            <thead>
              <tr className="border-b border-border bg-background-secondary text-[11px] text-foreground-muted">
                <th className="px-4 py-3 font-semibold">نام</th>
                <th className="px-4 py-3 font-semibold">پلن</th>
                <th className="px-4 py-3 font-semibold">تخفیف</th>
                <th className="px-4 py-3 font-semibold">بازه</th>
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
                      title="هنوز کمپینی ایجاد نشده"
                      description="با دکمهٔ «کمپین جدید» یک تخفیف خودکار روی یکی از پلن‌ها بسازید."
                    />
                  </td>
                </tr>
              ) : (
                items.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border text-foreground last:border-0 hover:bg-background-secondary"
                  >
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-foreground-muted">{planName(c.planId)}</td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {formatDiscountValue(c.discountType, c.discountValue)}
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {formatAdminDate(c.startsAt)} تا {formatAdminDate(c.endsAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={c.isActive ? "success" : "default"}>
                        {c.isActive ? "فعال" : "غیرفعال"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => openEdit(c)}>
                          ویرایش
                        </Button>
                        <Button
                          size="sm"
                          variant={c.isActive ? "destructive" : "default"}
                          isLoading={isToggling}
                          onClick={() =>
                            c.isActive ? deactivate(c.id) : activate(c.id)
                          }
                        >
                          {c.isActive ? "غیرفعال‌سازی" : "فعال‌سازی"}
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

      <CampaignFormDrawer
        open={drawerOpen}
        target={editTarget}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
