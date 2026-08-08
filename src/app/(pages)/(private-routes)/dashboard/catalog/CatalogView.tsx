"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/shared/components/primitives/button/Button";
import { Input } from "@/shared/components/primitives/input/Input";
import { useQueryCatalogOfferings, useMutateCatalogOfferings, useMutatePricingRules, useQueryPricingRules } from "@/services/domains/catalog/hooks";
import { useQueryServiceTypes } from "@/services/domains/service-type/hooks/useQueryServiceTypes";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";

export default function CatalogView() {
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const onSubmitOffering = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
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
        setSuccess("سرویس با موفقیت ویرایش شد.");
      } else {
        await offeringMutations.create.mutateAsync(body);
        setSuccess("سرویس جدید با موفقیت ثبت شد.");
      }
      resetOfferingForm();
    } catch (err) {
      setError(getApiErrorMessage(err, "ذخیره سرویس ناموفق بود."));
    }
  };

  const onCreatePricingRule = async () => {
    setError("");
    setSuccess("");
    try {
      const body = JSON.parse(pricingRuleJson) as Record<string, unknown>;
      await pricingMutations.create.mutateAsync(body);
      setSuccess("قانون قیمت‌گذاری ثبت شد.");
    } catch (err) {
      setError(getApiErrorMessage(err, "ثبت قانون قیمت‌گذاری ناموفق بود."));
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-col gap-4 px-safe-area pb-8">
      <div className="rounded-lg bg-surface-secondary p-3">
        <h1 className="mb-2 text-base font-bold text-foreground">مدیریت کاتالوگ سرویس‌ها</h1>
        <p className="text-xs text-foreground-muted">
          این بخش بر پایه مسیرهای جدید `api/catalog` پیاده‌سازی شده است.
        </p>
      </div>

      <div className="rounded-lg bg-surface-secondary p-3">
        <h2 className="mb-3 text-sm font-bold text-foreground">
          {editingId ? "ویرایش سرویس" : "افزودن سرویس جدید"}
        </h2>
        <form className="grid grid-cols-1 gap-2" onSubmit={onSubmitOffering}>
          <select
            className="h-12 rounded-[2px] bg-foreground/5 px-3 text-sm text-foreground"
            value={serviceTypeId}
            onChange={(e) => setServiceTypeId(Number(e.target.value))}
          >
            <option value="">نوع سرویس</option>
            {serviceTypes.map((serviceType) => (
              <option key={serviceType.id} value={Number(serviceType.id)}>
                {serviceType.name}
              </option>
            ))}
          </select>
          <select
            className="h-12 rounded-[2px] bg-foreground/5 px-3 text-sm text-foreground"
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
          </select>
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
          <div className="flex gap-2">
            <Button
              type="submit"
              isLoading={
                offeringMutations.create.isPending || offeringMutations.update.isPending
              }
            >
              {editingId ? "ذخیره ویرایش" : "افزودن سرویس"}
            </Button>
            {editingId ? (
              <Button type="button" variant="outline" onClick={resetOfferingForm}>
                انصراف
              </Button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="rounded-lg bg-surface-secondary p-3">
        <h2 className="mb-3 text-sm font-bold text-foreground">لیست سرویس‌ها</h2>
        {isLoading ? (
          <p className="text-sm text-foreground-muted">در حال بارگذاری...</p>
        ) : (
          <div className="space-y-2">
            {offerings.map((offering) => (
              <div key={offering.id} className="rounded-md border border-border p-3">
                <p className="text-sm font-bold text-foreground">
                  {offering.serviceTypeName ||
                    serviceTypeById.get(offering.serviceTypeId) ||
                    `سرویس #${offering.serviceTypeId}`}
                </p>
                <p className="text-xs text-foreground-muted">
                  مدت: {offering.durationMinutes} دقیقه | قیمت: {offering.basePrice.toLocaleString("fa-IR")} تومان
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditingId(offering.id);
                      setServiceTypeId(offering.serviceTypeId);
                      setBranchId(offering.branchId ?? "");
                      setBasePrice(String(offering.basePrice));
                      setDurationMinutes(String(offering.durationMinutes));
                      setDepositAmount(offering.depositAmount ? String(offering.depositAmount) : "");
                      setColor(offering.color || "#9be955");
                    }}
                  >
                    ویرایش
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
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
                    onClick={() => offeringMutations.remove.mutate(offering.id)}
                  >
                    حذف
                  </Button>
                </div>
              </div>
            ))}
            {offerings.length === 0 ? (
              <p className="text-xs text-foreground-muted">هنوز سرویسی ثبت نشده است.</p>
            ) : null}
          </div>
        )}
      </div>

      <div className="rounded-lg bg-surface-secondary p-3">
        <h2 className="mb-2 text-sm font-bold text-foreground">Pricing Rules</h2>
        <p className="mb-2 text-xs text-foreground-muted">
          برای انعطاف قراردادی، بدنه قانون را به صورت JSON وارد کنید.
        </p>
        <textarea
          className="min-h-36 w-full rounded-[2px] bg-foreground/5 p-3 text-xs text-foreground"
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
            <div key={rule.id} className="rounded-md border border-border p-2 text-xs">
              <pre className="overflow-x-auto whitespace-pre-wrap text-foreground-muted">
                {JSON.stringify(rule, null, 2)}
              </pre>
              <Button
                className="mt-2"
                size="sm"
                variant="outline"
                onClick={() => pricingMutations.remove.mutate(rule.id)}
              >
                حذف
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

