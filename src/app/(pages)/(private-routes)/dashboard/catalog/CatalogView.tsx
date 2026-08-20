"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/shared/components/primitives/button/Button";
import { Input } from "@/shared/components/primitives/input/Input";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/primitives/drawer/Drawer";
import { useQueryCatalogOfferings, useMutateCatalogOfferings, useMutatePricingRules, useQueryPricingRules } from "@/services/domains/catalog/hooks";
import { useQueryServiceTypes } from "@/services/domains/service-type/hooks/useQueryServiceTypes";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { formatToman } from "@/shared/utils/salonDisplay";
import {
  DashboardAdvanced,
  DashboardCard,
  DashboardEmptyState,
  DashboardPage,
  DashboardPageHeader,
  DashboardSelect,
  DashboardSkeleton,
  DashboardStatusChip,
  DashboardToast,
  type DashboardToastState,
} from "../_components";
import { dashboardQuietButtonClass } from "../_components/buttonClasses";

export default function CatalogView() {
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const [toast, setToast] = useState<DashboardToastState>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: offeringsRes, isLoading } = useQueryCatalogOfferings(true);
  const offerings = offeringsRes?.data ?? [];
  const offeringMutations = useMutateCatalogOfferings();

  const { data: serviceTypesRes } = useQueryServiceTypes();
  const serviceTypes = serviceTypesRes?.data ?? [];
  const salonDetail = useQuerySalonById(salonPublicId || undefined);
  const branches = salonDetail.data?.data?.branches ?? [];

  const [serviceTypeId, setServiceTypeId] = useState<number | "">("");
  const [branchId, setBranchId] = useState<number | "">("");
  const [basePrice, setBasePrice] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("45");
  const [depositAmount, setDepositAmount] = useState("");
  const [color, setColor] = useState("#9be955");
  const [editingId, setEditingId] = useState<number | null>(null);

  const pricingRulesQuery = useQueryPricingRules();
  const pricingRules = pricingRulesQuery.data?.data ?? [];
  const pricingMutations = useMutatePricingRules();
  const [pricingRuleJson, setPricingRuleJson] = useState(
    JSON.stringify({ scopeType: 1 }, null, 2)
  );

  const serviceTypeById = useMemo(
    () => new Map(serviceTypes.map((x) => [Number(x.id), x.name])),
    [serviceTypes]
  );

  const resetOfferingForm = () => {
    setServiceTypeId("");
    setBranchId("");
    setBasePrice("");
    setDurationMinutes("45");
    setDepositAmount("");
    setColor("#9be955");
    setEditingId(null);
  };

  const openCreate = () => {
    resetOfferingForm();
    setDrawerOpen(true);
  };

  const openEdit = (offering: (typeof offerings)[number]) => {
    setEditingId(offering.id);
    setServiceTypeId(offering.serviceTypeId);
    setBranchId(offering.branchId ?? "");
    setBasePrice(String(offering.basePrice));
    setDurationMinutes(String(offering.durationMinutes));
    setDepositAmount(offering.depositAmount ? String(offering.depositAmount) : "");
    setColor(offering.color || "#9be955");
    setDrawerOpen(true);
  };

  const onSubmitOffering = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (!serviceTypeId) {
        throw new Error("نوع سرویس را انتخاب کنید.");
      }

      const body = {
        serviceTypeId: Number(serviceTypeId),
        branchId: branchId ? Number(branchId) : null,
        durationMinutes: Number(durationMinutes),
        basePrice: Number(basePrice),
        bufferBeforeMinutes: 0,
        bufferAfterMinutes: 0,
        isOnlineBookable: true,
        requiresDeposit: Number(depositAmount) > 0,
        depositAmount: Number(depositAmount) > 0 ? Number(depositAmount) : null,
        color: color || null,
      };

      if (editingId) {
        await offeringMutations.update.mutateAsync({ id: editingId, body });
        setToast({ type: "success", message: "سرویس با موفقیت ویرایش شد." });
      } else {
        await offeringMutations.create.mutateAsync(body);
        setToast({ type: "success", message: "سرویس جدید با موفقیت ثبت شد." });
      }
      resetOfferingForm();
      setDrawerOpen(false);
    } catch (err) {
      setToast({
        type: "error",
        message: getApiErrorMessage(err, "ذخیره سرویس ناموفق بود."),
      });
    }
  };

  const onCreatePricingRule = async () => {
    try {
      const body = JSON.parse(pricingRuleJson) as Record<string, unknown>;
      await pricingMutations.create.mutateAsync(body);
      setToast({ type: "success", message: "قانون قیمت‌گذاری ثبت شد." });
    } catch (err) {
      setToast({
        type: "error",
        message: getApiErrorMessage(err, "ثبت قانون قیمت‌گذاری ناموفق بود."),
      });
    }
  };

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="کاتالوگ"
        description="سرویس‌های قابل رزرو سالن را مدیریت کنید."
        action={
          <Button size="sm" onClick={openCreate}>
            سرویس جدید
          </Button>
        }
      />

      {isLoading ? (
        <DashboardSkeleton cards={1} rows={4} />
      ) : offerings.length === 0 ? (
        <DashboardEmptyState
          title="هنوز سرویسی ثبت نشده"
          description="اولین سرویس کاتالوگ را اضافه کنید تا رزرو آنلاین فعال شود."
          action={
            <Button size="sm" onClick={openCreate}>
              افزودن سرویس
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {offerings.map((offering) => (
            <DashboardCard key={offering.id} className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: offering.color || "#9be955" }}
                  />
                  <p className="text-sm font-bold text-foreground">
                    {offering.serviceTypeName ||
                      serviceTypeById.get(offering.serviceTypeId) ||
                      "سرویس"}
                  </p>
                </div>
                <DashboardStatusChip
                  label={offering.isActive ? "فعال" : "غیرفعال"}
                  className={
                    offering.isActive
                      ? "bg-success-background text-success"
                      : "bg-foreground/10 text-foreground-muted"
                  }
                />
              </div>
              <p className="mt-1 text-xs text-foreground-muted">
                {offering.durationMinutes} دقیقه · {formatToman(offering.basePrice)} تومان
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className={dashboardQuietButtonClass} onClick={() => openEdit(offering)}>
                  ویرایش
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className={dashboardQuietButtonClass}
                  onClick={() =>
                    offeringMutations.patchActive.mutate({
                      id: offering.id,
                      isActive: !offering.isActive,
                    })
                  }
                >
                  {offering.isActive ? "غیرفعال" : "فعال"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className={dashboardQuietButtonClass}
                  onClick={() => offeringMutations.remove.mutate(offering.id)}
                >
                  حذف
                </Button>
              </div>
            </DashboardCard>
          ))}
        </div>
      )}

      <DashboardAdvanced title="قوانین قیمت‌گذاری">
        <p className="mb-2 text-xs text-foreground-muted">
          بدنه قانون را به صورت JSON وارد کنید.
        </p>
        <textarea
          className="min-h-36 w-full rounded-[2px] border border-input-border bg-input p-3 text-xs text-foreground"
          value={pricingRuleJson}
          onChange={(e) => setPricingRuleJson(e.target.value)}
        />
        <div className="mt-2">
          <Button
            size="sm"
            onClick={onCreatePricingRule}
            isLoading={pricingMutations.create.isPending}
          >
            ثبت قانون
          </Button>
        </div>
        <div className="mt-3 space-y-2">
          {pricingRules.map((rule) => (
            <div key={rule.id} className="rounded-[12px] border border-border p-2 text-xs">
              <pre className="overflow-x-auto whitespace-pre-wrap text-foreground-muted">
                {JSON.stringify(rule, null, 2)}
              </pre>
              <Button
                className={`mt-2 ${dashboardQuietButtonClass}`}
                size="sm"
                variant="outline"
                onClick={() => pricingMutations.remove.mutate(rule.id)}
              >
                حذف
              </Button>
            </div>
          ))}
        </div>
      </DashboardAdvanced>

      <Drawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) resetOfferingForm();
        }}
      >
        <DrawerContent className="max-h-[85vh] overflow-y-auto border-border bg-background">
          <DrawerHeader className="text-right">
            <DrawerTitle>{editingId ? "ویرایش سرویس" : "سرویس جدید"}</DrawerTitle>
          </DrawerHeader>
          <form className="grid grid-cols-1 gap-2 px-4 pb-6" onSubmit={onSubmitOffering}>
            <DashboardSelect
              value={serviceTypeId}
              onChange={(e) => setServiceTypeId(Number(e.target.value))}
            >
              <option value="">نوع سرویس</option>
              {serviceTypes.map((serviceType) => (
                <option key={serviceType.id} value={Number(serviceType.id)}>
                  {serviceType.name}
                </option>
              ))}
            </DashboardSelect>
            <DashboardSelect
              value={branchId}
              onChange={(e) => setBranchId(Number(e.target.value))}
            >
              <option value="">شعبه (اختیاری)</option>
              {branches.map((branch) => (
                <option
                  key={String(branch.id ?? branch.publicId)}
                  value={branch.id ?? ""}
                >
                  {branch.name}
                </option>
              ))}
            </DashboardSelect>
            <Input
              type="number"
              placeholder="قیمت پایه (تومان)"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
            />
            <Input
              type="number"
              placeholder="مدت (دقیقه)"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
            />
            <Input
              type="number"
              placeholder="بیعانه (اختیاری)"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
            <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            <Button
              type="submit"
              isLoading={
                offeringMutations.create.isPending || offeringMutations.update.isPending
              }
            >
              {editingId ? "ذخیره ویرایش" : "افزودن سرویس"}
            </Button>
          </form>
        </DrawerContent>
      </Drawer>

      <DashboardToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardPage>
  );
}
