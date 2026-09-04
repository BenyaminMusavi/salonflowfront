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
import { PricingRuleScopeType } from "@/services/domains/catalog/types/catalog.type";
import { useQueryServiceTypes } from "@/services/domains/service-type/hooks/useQueryServiceTypes";
import { useQueryStaffForOfferings } from "@/services/domains/staff-profile/hooks/useQueryStaffForOfferings";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { formatToman } from "@/shared/utils/salonDisplay";
import {
  DashboardAdvanced,
  DashboardCard,
  DashboardDateField,
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

const SCOPE_LABELS: Record<number, string> = {
  [PricingRuleScopeType.Standard]: "کل سالن",
  [PricingRuleScopeType.BranchSpecific]: "هر شعبه",
  [PricingRuleScopeType.StaffSpecific]: "هر پرسنل",
};

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

  // Only used when creating — the update endpoint has no service-type field at all,
  // so an existing offering's service type can never be changed (SF-QA-037).
  const [serviceTypePublicId, setServiceTypePublicId] = useState("");
  const [editingServiceTypeName, setEditingServiceTypeName] = useState("");
  const [branchId, setBranchId] = useState<number | "">("");
  const [basePrice, setBasePrice] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("45");
  const [depositAmount, setDepositAmount] = useState("");
  const [color, setColor] = useState("#9be955");
  const [editingId, setEditingId] = useState<number | null>(null);

  const pricingRulesQuery = useQueryPricingRules();
  const pricingRules = pricingRulesQuery.data?.data ?? [];
  const pricingMutations = useMutatePricingRules();

  const allOfferingPublicIds = useMemo(
    () => offerings.map((o) => o.publicId).filter(Boolean),
    [offerings]
  );
  const ruleStaffQuery = useQueryStaffForOfferings(
    salonPublicId || undefined,
    allOfferingPublicIds,
    { enabled: allOfferingPublicIds.length > 0 }
  );
  const ruleStaff = ruleStaffQuery.data?.data ?? [];

  const [ruleServiceTypeId, setRuleServiceTypeId] = useState<number | "">("");
  const [ruleScopeType, setRuleScopeType] = useState<number>(
    PricingRuleScopeType.Standard
  );
  const [ruleBranchId, setRuleBranchId] = useState<number | "">("");
  const [ruleStaffMemberId, setRuleStaffMemberId] = useState<number | "">("");
  const [rulePrice, setRulePrice] = useState("");
  const [ruleDuration, setRuleDuration] = useState("");
  const [ruleValidFrom, setRuleValidFrom] = useState("");
  const [ruleValidTo, setRuleValidTo] = useState("");

  const resetPricingRuleForm = () => {
    setRuleServiceTypeId("");
    setRuleScopeType(PricingRuleScopeType.Standard);
    setRuleBranchId("");
    setRuleStaffMemberId("");
    setRulePrice("");
    setRuleDuration("");
    setRuleValidFrom("");
    setRuleValidTo("");
  };

  // GET api/service-type only ever returns each type's Guid PublicId under `id` — there is
  // no numeric id to key this by from that endpoint. Offerings, however, carry both their
  // numeric serviceTypeId and its denormalized serviceTypeName, so derive the lookup from
  // there instead (used for e.g. showing a pricing rule's service type name).
  const serviceTypeNameById = useMemo(
    () => new Map(offerings.map((o) => [o.serviceTypeId, o.serviceTypeName])),
    [offerings]
  );

  const resetOfferingForm = () => {
    setServiceTypePublicId("");
    setEditingServiceTypeName("");
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
    setServiceTypePublicId("");
    setEditingServiceTypeName(offering.serviceTypeName);
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
      if (!editingId && !serviceTypePublicId) {
        throw new Error("نوع سرویس را انتخاب کنید.");
      }

      const commonBody = {
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
        await offeringMutations.update.mutateAsync({ id: editingId, body: commonBody });
        setToast({ type: "success", message: "سرویس با موفقیت ویرایش شد." });
      } else {
        await offeringMutations.create.mutateAsync({
          ...commonBody,
          serviceTypePublicId,
        });
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
    if (!ruleServiceTypeId) {
      setToast({ type: "error", message: "نوع سرویس را انتخاب کنید." });
      return;
    }
    if (!rulePrice || Number(rulePrice) < 0) {
      setToast({ type: "error", message: "قیمت معتبر وارد کنید." });
      return;
    }
    if (ruleScopeType === PricingRuleScopeType.BranchSpecific && !ruleBranchId) {
      setToast({ type: "error", message: "برای این محدوده، شعبه را انتخاب کنید." });
      return;
    }
    if (ruleScopeType === PricingRuleScopeType.StaffSpecific && !ruleStaffMemberId) {
      setToast({ type: "error", message: "برای این محدوده، پرسنل را انتخاب کنید." });
      return;
    }

    try {
      await pricingMutations.create.mutateAsync({
        serviceTypeId: Number(ruleServiceTypeId),
        scopeType: ruleScopeType,
        price: Number(rulePrice),
        branchId:
          ruleScopeType === PricingRuleScopeType.BranchSpecific
            ? Number(ruleBranchId)
            : null,
        staffMemberId:
          ruleScopeType === PricingRuleScopeType.StaffSpecific
            ? Number(ruleStaffMemberId)
            : null,
        durationMinutes: ruleDuration ? Number(ruleDuration) : null,
        validFrom: ruleValidFrom ? new Date(ruleValidFrom).toISOString() : null,
        validTo: ruleValidTo ? new Date(ruleValidTo).toISOString() : null,
      });
      setToast({ type: "success", message: "قانون قیمت‌گذاری ثبت شد." });
      resetPricingRuleForm();
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
                      serviceTypeNameById.get(offering.serviceTypeId) ||
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
          برای یک نوع سرویس، قیمت جایگزین برای کل سالن، یک شعبه یا یک پرسنل مشخص تعریف کنید.
        </p>
        <div className="grid grid-cols-1 gap-2">
          <DashboardSelect
            value={ruleServiceTypeId}
            onChange={(e) => setRuleServiceTypeId(Number(e.target.value))}
          >
            <option value="">نوع سرویس</option>
            {serviceTypes.map((serviceType) => (
              <option key={serviceType.id} value={Number(serviceType.id)}>
                {serviceType.name}
              </option>
            ))}
          </DashboardSelect>

          <DashboardSelect
            value={ruleScopeType}
            onChange={(e) => {
              setRuleScopeType(Number(e.target.value));
              setRuleBranchId("");
              setRuleStaffMemberId("");
            }}
          >
            {Object.entries(SCOPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </DashboardSelect>

          {ruleScopeType === PricingRuleScopeType.BranchSpecific && (
            <DashboardSelect
              value={ruleBranchId}
              onChange={(e) => setRuleBranchId(Number(e.target.value))}
            >
              <option value="">انتخاب شعبه</option>
              {branches.map((branch) => (
                <option key={branch.publicId} value={branch.branchId}>
                  {branch.name}
                </option>
              ))}
            </DashboardSelect>
          )}

          {ruleScopeType === PricingRuleScopeType.StaffSpecific && (
            <DashboardSelect
              value={ruleStaffMemberId}
              onChange={(e) => setRuleStaffMemberId(Number(e.target.value))}
            >
              <option value="">انتخاب پرسنل</option>
              {ruleStaff.map((member) => (
                <option key={member.staffMemberId} value={member.staffMemberId}>
                  {member.firstName || "پرسنل"}
                </option>
              ))}
            </DashboardSelect>
          )}

          <Input
            type="number"
            placeholder="قیمت (تومان)"
            value={rulePrice}
            onChange={(e) => setRulePrice(e.target.value)}
          />
          <Input
            type="number"
            placeholder="مدت اختصاصی به دقیقه (اختیاری)"
            value={ruleDuration}
            onChange={(e) => setRuleDuration(e.target.value)}
          />
          <DashboardDateField
            name="pricing-rule-valid-from"
            value={ruleValidFrom}
            onChange={setRuleValidFrom}
            label="شروع اعتبار (اختیاری)"
          />
          <DashboardDateField
            name="pricing-rule-valid-to"
            value={ruleValidTo}
            onChange={setRuleValidTo}
            label="پایان اعتبار (اختیاری)"
          />
        </div>
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
          {pricingRules.map((rule) => {
            const scopeDetail =
              rule.scopeType === PricingRuleScopeType.BranchSpecific
                ? branches.find((b) => b.branchId === rule.branchId)?.name
                : rule.scopeType === PricingRuleScopeType.StaffSpecific
                  ? ruleStaff.find((s) => s.staffMemberId === rule.staffMemberId)
                      ?.firstName
                  : null;
            return (
              <div
                key={rule.id}
                className="flex items-center justify-between gap-2 rounded-[12px] border border-border p-3 text-xs"
              >
                <div>
                  <p className="font-semibold text-foreground">
                    {serviceTypeNameById.get(rule.serviceTypeId) || "سرویس"} ·{" "}
                    {formatToman(rule.price)} تومان
                  </p>
                  <p className="mt-0.5 text-foreground-muted">
                    {SCOPE_LABELS[rule.scopeType] || "-"}
                    {scopeDetail ? ` (${scopeDetail})` : ""}
                    {rule.durationMinutes ? ` · ${rule.durationMinutes} دقیقه` : ""}
                  </p>
                </div>
                <Button
                  className={dashboardQuietButtonClass}
                  size="sm"
                  variant="outline"
                  onClick={() => pricingMutations.remove.mutate(rule.id)}
                >
                  حذف
                </Button>
              </div>
            );
          })}
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
            {editingId ? (
              <div className="flex h-12 w-full items-center rounded-[2px] border border-input-border bg-input px-3 text-sm text-foreground-muted">
                نوع سرویس: {editingServiceTypeName || "-"} (غیرقابل تغییر)
              </div>
            ) : (
              <DashboardSelect
                value={serviceTypePublicId}
                onChange={(e) => setServiceTypePublicId(e.target.value)}
              >
                <option value="">نوع سرویس</option>
                {serviceTypes.map((serviceType) => (
                  <option key={String(serviceType.id)} value={String(serviceType.id)}>
                    {serviceType.name}
                  </option>
                ))}
              </DashboardSelect>
            )}
            <DashboardSelect
              value={branchId}
              onChange={(e) => setBranchId(Number(e.target.value))}
            >
              <option value="">شعبه (اختیاری)</option>
              {branches.map((branch) => (
                <option key={branch.publicId} value={branch.branchId}>
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
