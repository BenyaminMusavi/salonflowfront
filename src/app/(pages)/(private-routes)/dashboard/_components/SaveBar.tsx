"use client";

import { Button } from "@/shared/components/primitives/button/Button";

/** Sticky «ذخیره» bar for a form — render it only while there are unsaved changes. */
export function SaveBar({
  label = "ذخیره",
  onSave,
  onDiscard,
  isSaving,
}: {
  label?: string;
  onSave: () => void;
  onDiscard: () => void;
  isSaving?: boolean;
}) {
  return (
    <div className="sticky bottom-24 z-20 flex items-center gap-2 rounded-[16px] bg-background-elevated p-3 shadow-lg lg:bottom-4">
      <p className="flex-1 text-xs text-foreground-muted">تغییرات ذخیره نشده</p>
      <Button type="button" variant="ghost" size="sm" onClick={onDiscard} disabled={isSaving}>
        لغو
      </Button>
      <Button type="button" size="sm" className="rounded-[12px]" isLoading={isSaving} onClick={onSave}>
        {label}
      </Button>
    </div>
  );
}
