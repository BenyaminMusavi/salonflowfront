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
import { TextArea } from "@/shared/components/primitives/textArea/TextArea";
import { MoneyInput } from "@/shared/components/primitives/input/MoneyInput";
import { useMutateSaveAdminPlan } from "@/services/domains/subscriptions/hooks/useAdminSubscriptionPlans";
import { IAdminSubscriptionPlan } from "@/services/domains/subscriptions/types/subscriptions.type";
import {
  rialToToman,
  tomanToRial,
} from "@/services/domains/subscriptions/utils/subscription-display";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";

/** null target = create mode; a plan = edit mode. The admin types Toman; the API stores RIALS. */
export function PlanFormDrawer({
  open,
  target,
  onClose,
}: {
  open: boolean;
  target: IAdminSubscriptionPlan | null;
  onClose: () => void;
}) {
  const isEdit = !!target;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationMonths, setDurationMonths] = useState("");
  /** Toman, as typed. */
  const [priceToman, setPriceToman] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setName(target?.name ?? "");
    setDescription(target?.description ?? "");
    setDurationMonths(target ? String(target.durationMonths) : "");
    setPriceToman(target ? rialToToman(target.price) : null);
  }, [open, target]);

  const { mutateAsync: save, isPending } = useMutateSaveAdminPlan();

  const handleConfirm = async () => {
    setError("");
    const months = Number(durationMonths);
    if (!name.trim()) {
      setError("نام طرح الزامی است.");
      return;
    }
    if (!Number.isInteger(months) || months < 1 || months > 120) {
      setError("مدت طرح باید بین 1 تا 120 ماه باشد.");
      return;
    }
    if (priceToman == null || priceToman < 0) {
      setError("قیمت طرح را وارد کنید.");
      return;
    }

    try {
      await save({
        planPublicId: target?.publicId ?? null,
        data: {
          name: name.trim(),
          description: description.trim() || null,
          durationMonths: months,
          price: tomanToRial(priceToman),
        },
      });
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e, "ذخیره طرح ناموفق بود."));
    }
  };

  return (
    <Drawer open={open} onOpenChange={(next) => !next && onClose()} direction="right">
      <DrawerContent showHandle={false} className="w-full sm:max-w-sm">
        <DrawerHeader className="border-b border-border text-right">
          <DrawerTitle className="text-base">{isEdit ? "ویرایش طرح" : "طرح جدید"}</DrawerTitle>
          <DrawerDescription className="text-xs">
            {isEdit
              ? "تغییر قیمت یا مدت فقط روی خریدهای بعدی اثر دارد؛ مشترک‌های فعلی تغییری نمی‌کنند."
              : "طرح جدید بلافاصله فعال و قابل خرید است."}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground">نام طرح</label>
              <Input
                placeholder="مثلاً 3 ماهه"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground">توضیحات (اختیاری)</label>
              <TextArea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground">مدت (ماه)</label>
              <Input
                type="number"
                inputMode="numeric"
                dir="ltr"
                min={1}
                max={120}
                placeholder="1 تا 120"
                value={durationMonths}
                onChange={(e) => setDurationMonths(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground">قیمت</label>
              <MoneyInput value={priceToman} onValueChange={setPriceToman} />
            </div>

            {error && <p className="text-xs font-medium text-error">{error}</p>}
          </div>
        </div>

        <DrawerFooter className="border-t border-border">
          <div className="flex gap-2">
            <Button className="flex-1" isLoading={isPending} onClick={handleConfirm}>
              {isEdit ? "ذخیره تغییرات" : "ایجاد طرح"}
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
