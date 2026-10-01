"use client";

import { useMemo, useState } from "react";
import { CaretLeftIcon, PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/shared/components/primitives/button/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/primitives/dialog/Dialog";
import {
  useMutateCatalogOfferings,
  useMutatePricingRules,
  useQueryCatalogOfferings,
} from "@/services/domains/catalog/hooks";
import type { IServiceOffering } from "@/services/domains/catalog/types/catalog.type";
import { useQueryServiceTypes } from "@/services/domains/service-type/hooks/useQueryServiceTypes";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { RouteAddress } from "@/shared/data/routeAddress";
import { getServiceTypeIcon } from "@/shared/data/serviceTypeIcons";
import { formatToman } from "@/shared/utils/salonDisplay";
import { APP_LOCALE } from "@/shared/utils/locale";
import { cn } from "@/shared/utils/className";
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardSkeleton,
  DashboardToast,
  type DashboardToastState,
} from "../_components";
import { dashboardQuietButtonClass } from "../_components/buttonClasses";
import { useSalonStaff } from "../_staff/useSalonStaff";
import { ServiceEditor } from "./ServiceEditor";

type Confirm =
  | { kind: "service"; offering: IServiceOffering }
  | { kind: "rule"; id: number; label: string }
  | null;

/** «خدمات» — what the salon offers; a row opens the editor (price, duration, who, special prices). */
export default function CatalogView() {
  const { data, isLoading } = useQueryCatalogOfferings(true);
  const offerings = useMemo(
    () => [...(data?.data ?? [])].sort((a, b) => Number(b.isActive) - Number(a.isActive)),
    [data]
  );
  const serviceTypes = useQueryServiceTypes().data?.data ?? [];
  const { members, branches } = useSalonStaff();
  const offeringMutations = useMutateCatalogOfferings();
  const ruleMutations = useMutatePricingRules();

  const [toast, setToast] = useState<DashboardToastState>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<Confirm>(null);

  const editing = offerings.find((o) => o.id === editingId) ?? null;
  const usedNames = useMemo(() => new Set(offerings.map((o) => o.serviceTypeName)), [offerings]);
  const providerCount = (o: IServiceOffering) =>
    members.filter((m) => m.offeringPublicIds.includes(o.publicId)).length;

  const openCreate = () => {
    setEditingId(null);
    setEditorOpen(true);
  };

  const doConfirm = async () => {
    if (!confirm) return;
    try {
      if (confirm.kind === "service") {
        await offeringMutations.remove.mutateAsync(confirm.offering.id);
        setEditorOpen(false);
        setToast({ type: "success", message: "خدمت حذف شد." });
      } else {
        await ruleMutations.remove.mutateAsync(confirm.id);
        setToast({ type: "success", message: "قیمت ویژه حذف شد." });
      }
    } catch (err) {
      setToast({ type: "error", message: getApiErrorMessage(err, "حذف ناموفق بود.") });
    }
    setConfirm(null);
  };

  return (
    <DashboardPage className="gap-4">
      <DashboardPageHeader
        title="خدمات"
        backHref={RouteAddress.DASHBOARD.SALON}
        action={
          <Button size="sm" className="gap-1 rounded-[12px]" onClick={openCreate}>
            <PlusIcon size={14} weight="bold" />
            خدمت
          </Button>
        }
      />

      {isLoading ? (
        <DashboardSkeleton cards={1} rows={4} />
      ) : offerings.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[16px] bg-background-secondary p-8 text-center">
          <p className="text-sm font-bold text-foreground">هنوز خدمتی تعریف نشده</p>
          <p className="text-xs text-foreground-muted">اولین خدمت را اضافه کنید تا رزرو آنلاین فعال شود.</p>
          <Button size="sm" className="rounded-[12px]" onClick={openCreate}>
            افزودن خدمت
          </Button>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
          {offerings.map((o) => {
            const Icon = getServiceTypeIcon(o.serviceTypeName);
            const count = providerCount(o);
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  setEditingId(o.id);
                  setEditorOpen(true);
                }}
                className="flex items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-surface-hover"
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    o.isActive ? "bg-surface-brand text-content-brand" : "bg-surface-hover text-foreground-muted"
                  )}
                >
                  <Icon size={20} weight="duotone" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate text-[15px] font-bold", o.isActive ? "text-foreground" : "text-foreground-muted")}>
                    {o.serviceTypeName}
                  </span>
                  <span className="block truncate text-xs tabular-nums text-foreground-muted">
                    {o.durationMinutes} دقیقه · {formatToman(o.basePrice)} تومان ·{" "}
                    {count ? `${count.toLocaleString(APP_LOCALE)} نفر` : "بدون پرسنل"}
                    {o.isActive ? "" : " · غیرفعال"}
                  </span>
                </span>
                <CaretLeftIcon size={16} className="shrink-0 text-foreground-muted" />
              </button>
            );
          })}
        </div>
      )}

      <ServiceEditor
        open={editorOpen}
        offering={editing}
        serviceTypes={serviceTypes}
        usedServiceTypeNames={usedNames}
        branches={branches}
        staff={members}
        onOpenChange={setEditorOpen}
        onCreated={(id) => setEditingId(id)}
        onRequestDelete={(offering) => setConfirm({ kind: "service", offering })}
        onRequestDeleteRule={(id, label) => setConfirm({ kind: "rule", id, label })}
        onToast={setToast}
      />

      <Dialog open={!!confirm} onOpenChange={(open) => !open && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirm?.kind === "service" ? `حذف «${confirm.offering.serviceTypeName}»؟` : "حذف قیمت ویژه؟"}
            </DialogTitle>
            <DialogDescription>
              {confirm?.kind === "service"
                ? "از فهرست خدمات و رزرو آنلاین برداشته می‌شود. اگر فقط موقتاً ارائه نمی‌دهید، «قابل رزرو» را خاموش کنید."
                : confirm?.label}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" className={dashboardQuietButtonClass} onClick={() => setConfirm(null)}>
              انصراف
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-error hover:bg-error-background"
              isLoading={offeringMutations.remove.isPending || ruleMutations.remove.isPending}
              onClick={() => void doConfirm()}
            >
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DashboardToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardPage>
  );
}
