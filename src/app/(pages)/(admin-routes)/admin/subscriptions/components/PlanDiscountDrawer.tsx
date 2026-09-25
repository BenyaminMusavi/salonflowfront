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
import {
  useMutateRemoveAdminPlanDiscount,
  useMutateSetAdminPlanDiscount,
} from "@/services/domains/subscriptions/hooks/useAdminSubscriptionPlans";
import { IAdminSubscriptionPlan } from "@/services/domains/subscriptions/types/subscriptions.type";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { salonWallClockToUtcIso, utcToSalonYmd } from "@/shared/utils/salonTime";
import { AdminDateField } from "../../_components/AdminDateField";

const DAY_MS = 86_400_000;

/**
 * One percentage discount per plan; saving replaces the current one. Empty duration = no end
 * date, empty start = starts now. The discounted price itself always comes from the server.
 */
export function PlanDiscountDrawer({
  plan,
  onClose,
}: {
  plan: IAdminSubscriptionPlan | null;
  onClose: () => void;
}) {
  const open = !!plan;
  const current = plan?.discount ?? null;

  const [name, setName] = useState("");
  const [percent, setPercent] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!plan) return;
    setError("");
    const d = plan.discount;
    setName(d?.name ?? "");
    setPercent(d ? String(d.percent) : "");
    setDurationDays(
      d?.endsAt
        ? String(Math.round((Date.parse(d.endsAt) - Date.parse(d.startsAt)) / DAY_MS))
        : ""
    );
    // A running discount restarts "now" when re-saved; only a scheduled one keeps its start day.
    setStartsAt(d && !d.isEffectiveNow ? utcToSalonYmd(d.startsAt) : "");
  }, [plan]);

  const { mutateAsync: setDiscount, isPending: isSaving } = useMutateSetAdminPlanDiscount();
  const { mutateAsync: removeDiscount, isPending: isRemoving } =
    useMutateRemoveAdminPlanDiscount();
  const isPending = isSaving || isRemoving;

  const handleSave = async () => {
    if (!plan) return;
    setError("");
    const pct = Number(percent);
    const days = durationDays.trim() ? Number(durationDays) : null;
    if (!name.trim()) {
      setError("عنوان تخفیف را وارد کنید.");
      return;
    }
    if (!Number.isFinite(pct) || pct < 1 || pct > 100) {
      setError("درصد تخفیف باید بین 1 تا 100 باشد.");
      return;
    }
    if (days != null && (!Number.isInteger(days) || days < 1)) {
      setError("مدت تخفیف باید یک عدد صحیح مثبت باشد، یا خالی بماند.");
      return;
    }

    try {
      await setDiscount({
        planPublicId: plan.publicId,
        data: {
          name: name.trim(),
          percent: pct,
          durationDays: days,
          // Start of the chosen day in Tehran; omitted = from now.
          startsAt: startsAt ? salonWallClockToUtcIso(startsAt, "00:00") : null,
        },
      });
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e, "ذخیره تخفیف ناموفق بود."));
    }
  };

  const handleRemove = async () => {
    if (!plan) return;
    setError("");
    try {
      await removeDiscount(plan.publicId);
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e, "برداشتن تخفیف ناموفق بود."));
    }
  };

  return (
    <Drawer open={open} onOpenChange={(next) => !next && onClose()} direction="right">
      <DrawerContent showHandle={false} className="w-full sm:max-w-sm">
        <DrawerHeader className="border-b border-border text-right">
          <DrawerTitle className="text-base">تخفیف طرح «{plan?.name}»</DrawerTitle>
          <DrawerDescription className="text-xs">
            هر طرح فقط یک تخفیف درصدی دارد؛ ذخیره‌ی تخفیف جدید، تخفیف فعلی را جایگزین می‌کند.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground">عنوان تخفیف</label>
              <Input
                placeholder="مثلاً افتتاحیه"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground">درصد تخفیف (٪)</label>
              <Input
                type="number"
                inputMode="numeric"
                dir="ltr"
                min={1}
                max={100}
                placeholder="1 تا 100"
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground">مدت (روز، اختیاری)</label>
              <Input
                type="number"
                inputMode="numeric"
                dir="ltr"
                min={1}
                placeholder="خالی = بدون تاریخ پایان"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <AdminDateField
                name="discountStartsAt"
                label="شروع (اختیاری)"
                placeholder="خالی = از همین حالا"
                value={startsAt}
                onChange={setStartsAt}
              />
              {startsAt && (
                <button
                  type="button"
                  onClick={() => setStartsAt("")}
                  className="self-start text-xs font-medium text-primary"
                >
                  شروع از همین حالا
                </button>
              )}
            </div>

            {error && <p className="text-xs font-medium text-error">{error}</p>}
          </div>
        </div>

        <DrawerFooter className="border-t border-border">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button className="flex-1" isLoading={isSaving} disabled={isPending} onClick={handleSave}>
                {current ? "جایگزینی تخفیف" : "ثبت تخفیف"}
              </Button>
              <Button variant="secondary" onClick={onClose} disabled={isPending}>
                انصراف
              </Button>
            </div>
            {current && (
              <Button
                variant="destructive"
                isLoading={isRemoving}
                disabled={isPending}
                onClick={handleRemove}
              >
                برداشتن تخفیف
              </Button>
            )}
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
