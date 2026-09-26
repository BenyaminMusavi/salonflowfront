"use client";

import { useId } from "react";
import { Checkbox } from "@/shared/components/primitives/checkbox/Checkbox";

/**
 * «اطلاع به مشتری با پیامک» — salon-side cancel / reschedule / no-show send `notifyCustomer`.
 * Defaults differ per action (on for cancel & reschedule, off for no-show); the caller owns it.
 */
export function NotifyCustomerCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-surface p-3">
      <label htmlFor={id} className="flex cursor-pointer items-center gap-2">
        <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v === true)} />
        <span className="text-sm font-medium text-foreground">اطلاع به مشتری با پیامک</span>
      </label>
      <p className="text-xs text-foreground-muted">
        اگر خودتان تلفنی خبر داده‌اید، تیک را بردارید.
      </p>
    </div>
  );
}
