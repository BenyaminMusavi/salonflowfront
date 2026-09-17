"use client";

import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/shared/components/primitives/drawer/Drawer";
import { Button } from "@/shared/components/primitives/button/Button";
import { Input } from "@/shared/components/primitives/input/Input";
import { useQuerySubscriptionPlans } from "@/services/domains/subscriptions/hooks/useQuerySubscriptionPlans";
import {
  useMutateCreatePromoCode,
  useMutateUpdatePromoCode,
} from "@/services/domains/subscriptions/hooks/useMutatePromoCodeActions";
import { IPromoCode } from "@/services/domains/subscriptions/types/subscriptions.type";
import { PromoDiscountType } from "@/services/common/enums/domain-enums";
import { AdminDateField } from "../../_components/AdminDateField";
import { AdminSelectFilter } from "../../_components/AdminSelectFilter";

const ANY_PLAN_VALUE = "";

/** null target = create mode; an IPromoCode = edit mode (code and plan are fixed, not editable). */
export function PromoCodeFormDrawer({
  open,
  target,
  onClose,
}: {
  open: boolean;
  target: IPromoCode | null;
  onClose: () => void;
}) {
  const isEdit = !!target;
  const { data: plansRes } = useQuerySubscriptionPlans();
  const plans = plansRes?.data ?? [];

  const [code, setCode] = useState("");
  const [planId, setPlanId] = useState<string>(ANY_PLAN_VALUE);
  const [discountType, setDiscountType] = useState<PromoDiscountType>(
    PromoDiscountType.Percentage
  );
  const [discountValue, setDiscountValue] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setCode(target?.code ?? "");
    setPlanId(target?.planId != null ? String(target.planId) : ANY_PLAN_VALUE);
    setDiscountType(target?.discountType ?? PromoDiscountType.Percentage);
    setDiscountValue(target ? String(target.discountValue) : "");
    setMaxRedemptions(target?.maxRedemptions != null ? String(target.maxRedemptions) : "");
    setStartsAt(target?.startsAt?.slice(0, 10) ?? "");
    setEndsAt(target?.endsAt?.slice(0, 10) ?? "");
  }, [open, target]);

  const { mutateAsync: create, isPending: isCreating } = useMutateCreatePromoCode();
  const { mutateAsync: update, isPending: isUpdating } = useMutateUpdatePromoCode();
  const isPending = isCreating || isUpdating;

  const handleConfirm = async () => {
    setError("");
    const value = Number(discountValue);
    if (!isEdit && !code.trim()) {
      setError("کد تخفیف را وارد کنید.");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      setError("مقدار تخفیف باید عددی بزرگ‌تر از صفر باشد.");
      return;
    }
    const maxRedemptionsValue =
      maxRedemptions.trim() === "" ? null : Number(maxRedemptions);
    if (maxRedemptionsValue != null && (!Number.isFinite(maxRedemptionsValue) || maxRedemptionsValue <= 0)) {
      setError("حداکثر تعداد استفاده باید عددی بزرگ‌تر از صفر باشد.");
      return;
    }

    const sharedPayload = {
      discountType,
      discountValue: value,
      maxRedemptions: maxRedemptionsValue,
      startsAt: startsAt ? `${startsAt}T00:00:00` : null,
      endsAt: endsAt ? `${endsAt}T23:59:59` : null,
    };

    try {
      if (isEdit && target) {
        await update({ promoId: target.id, data: sharedPayload });
      } else {
        await create({
          ...sharedPayload,
          code: code.trim().toUpperCase(),
          planId: planId ? Number(planId) : null,
        });
      }
      onClose();
    } catch {
      setError("ذخیره کد تخفیف ناموفق بود.");
    }
  };

  return (
    <Drawer open={open} onOpenChange={(next) => !next && onClose()} direction="right">
      <DrawerContent showHandle={false} className="w-full sm:max-w-sm">
        <DrawerHeader className="border-b border-border text-right">
          <DrawerTitle className="text-base">
            {isEdit ? "ویرایش کد تخفیف" : "کد تخفیف جدید"}
          </DrawerTitle>
          <DrawerDescription className="text-xs">
            کدی که مالک سالن هنگام خرید اشتراک وارد می‌کند.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground">کد</label>
              <Input
                placeholder="مثلاً SUMMER25"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                dir="ltr"
                disabled={isEdit}
              />
            </div>

            {!isEdit && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-foreground">پلن</label>
                <AdminSelectFilter
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="w-full"
                >
                  <option value={ANY_PLAN_VALUE}>همهٔ پلن‌ها</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </AdminSelectFilter>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground">نوع تخفیف</label>
              <AdminSelectFilter
                value={String(discountType)}
                onChange={(e) => setDiscountType(Number(e.target.value))}
                className="w-full"
              >
                <option value={String(PromoDiscountType.Percentage)}>درصدی</option>
                <option value={String(PromoDiscountType.FixedAmount)}>مبلغ ثابت</option>
              </AdminSelectFilter>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground">
                مقدار تخفیف{" "}
                {discountType === PromoDiscountType.Percentage ? "(٪)" : "(تومان)"}
              </label>
              <Input
                type="number"
                dir="ltr"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground">
                حداکثر تعداد استفاده (اختیاری)
              </label>
              <Input
                type="number"
                dir="ltr"
                placeholder="نامحدود"
                value={maxRedemptions}
                onChange={(e) => setMaxRedemptions(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <AdminDateField
                name="startsAt"
                label="شروع (اختیاری)"
                value={startsAt}
                onChange={setStartsAt}
              />
              <AdminDateField
                name="endsAt"
                label="پایان (اختیاری)"
                value={endsAt}
                onChange={setEndsAt}
              />
            </div>

            {error && <p className="text-xs font-medium text-error">{error}</p>}
          </div>
        </div>

        <DrawerFooter className="border-t border-border">
          <div className="flex gap-2">
            <Button className="flex-1" isLoading={isPending} onClick={handleConfirm}>
              {isEdit ? "ذخیره تغییرات" : "ایجاد کد تخفیف"}
            </Button>
            <Button variant="secondary" onClick={onClose} disabled={isPending}>
              انصراف
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
