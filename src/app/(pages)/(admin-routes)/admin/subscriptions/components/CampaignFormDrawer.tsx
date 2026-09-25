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
import { MoneyInput } from "@/shared/components/primitives/input/MoneyInput";
import { salonWallClockToUtcIso, utcToSalonYmd } from "@/shared/utils/salonTime";
import { useQuerySubscriptionPlans } from "@/services/domains/subscriptions/hooks/useQuerySubscriptionPlans";
import {
  useMutateCreateCampaign,
  useMutateUpdateCampaign,
} from "@/services/domains/subscriptions/hooks/useMutateCampaignActions";
import { IPlanCampaign } from "@/services/domains/subscriptions/types/subscriptions.type";
import { PlanCampaignDiscountType } from "@/services/common/enums/domain-enums";
import { AdminDateField } from "../../_components/AdminDateField";
import { AdminSelectFilter } from "../../_components/AdminSelectFilter";

/** null target = create mode; an IPlanCampaign = edit mode (planId is fixed, not editable). */
export function CampaignFormDrawer({
  open,
  target,
  onClose,
}: {
  open: boolean;
  target: IPlanCampaign | null;
  onClose: () => void;
}) {
  const isEdit = !!target;
  const { data: plansRes } = useQuerySubscriptionPlans();
  const plans = plansRes?.data ?? [];

  const [planId, setPlanId] = useState<string>("");
  const [name, setName] = useState("");
  const [discountType, setDiscountType] = useState<PlanCampaignDiscountType>(
    PlanCampaignDiscountType.Percentage
  );
  const [discountValue, setDiscountValue] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setPlanId(target ? String(target.planId) : String(plans[0]?.id ?? ""));
    setName(target?.name ?? "");
    setDiscountType(target?.discountType ?? PlanCampaignDiscountType.Percentage);
    setDiscountValue(target ? String(target.discountValue) : "");
    setStartsAt(target?.startsAt ? utcToSalonYmd(target.startsAt) : "");
    setEndsAt(target?.endsAt ? utcToSalonYmd(target.endsAt) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- plans loads async; re-running on it would clobber user edits
  }, [open, target]);

  const { mutateAsync: create, isPending: isCreating } = useMutateCreateCampaign();
  const { mutateAsync: update, isPending: isUpdating } = useMutateUpdateCampaign();
  const isPending = isCreating || isUpdating;

  const handleConfirm = async () => {
    setError("");
    const value = Number(discountValue);
    if (!name.trim()) {
      setError("نام کمپین را وارد کنید.");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      setError("مقدار تخفیف باید عددی بزرگ‌تر از صفر باشد.");
      return;
    }
    if (!startsAt || !endsAt) {
      setError("تاریخ شروع و پایان الزامی است.");
      return;
    }

    const payload = {
      name: name.trim(),
      discountType,
      discountValue: value,
      startsAt: salonWallClockToUtcIso(startsAt, "00:00"),
      endsAt: salonWallClockToUtcIso(endsAt, "23:59:59"),
    };

    try {
      if (isEdit && target) {
        await update({ campaignId: target.id, data: payload });
      } else {
        if (!planId) {
          setError("یک پلن انتخاب کنید.");
          return;
        }
        await create({ ...payload, planId: Number(planId) });
      }
      onClose();
    } catch {
      setError("ذخیره کمپین ناموفق بود.");
    }
  };

  return (
    <Drawer open={open} onOpenChange={(next) => !next && onClose()} direction="right">
      <DrawerContent showHandle={false} className="w-full sm:max-w-sm">
        <DrawerHeader className="border-b border-border text-right">
          <DrawerTitle className="text-base">
            {isEdit ? "ویرایش کمپین" : "کمپین جدید"}
          </DrawerTitle>
          <DrawerDescription className="text-xs">
            تخفیف خودکار روی یک پلن اشتراک برای بازهٔ زمانی مشخص.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="flex flex-col gap-4">
            {!isEdit && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-foreground">پلن</label>
                <AdminSelectFilter
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="w-full"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </AdminSelectFilter>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground">نام کمپین</label>
              <Input
                placeholder="مثلاً جشنواره تابستانه"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground">نوع تخفیف</label>
              <AdminSelectFilter
                value={String(discountType)}
                onChange={(e) => setDiscountType(Number(e.target.value))}
                className="w-full"
              >
                <option value={String(PlanCampaignDiscountType.Percentage)}>درصدی</option>
                <option value={String(PlanCampaignDiscountType.FixedAmount)}>مبلغ ثابت</option>
              </AdminSelectFilter>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground">
                مقدار تخفیف{" "}
                {discountType === PlanCampaignDiscountType.Percentage ? "(٪)" : "(تومان)"}
              </label>
              {discountType === PlanCampaignDiscountType.Percentage ? (
                <Input
                  type="number"
                  dir="ltr"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                />
              ) : (
                <MoneyInput
                  value={discountValue}
                  onValueChange={(v) => setDiscountValue(v == null ? "" : String(v))}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <AdminDateField
                name="startsAt"
                label="شروع"
                value={startsAt}
                onChange={setStartsAt}
              />
              <AdminDateField name="endsAt" label="پایان" value={endsAt} onChange={setEndsAt} />
            </div>

            {error && <p className="text-xs font-medium text-error">{error}</p>}
          </div>
        </div>

        <DrawerFooter className="border-t border-border">
          <div className="flex gap-2">
            <Button className="flex-1" isLoading={isPending} onClick={handleConfirm}>
              {isEdit ? "ذخیره تغییرات" : "ایجاد کمپین"}
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
