"use client";

import { ReactNode, useState } from "react";
import { Button } from "@/shared/components/primitives/button/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/primitives/dialog/Dialog";
import { cn } from "@/shared/utils/className";

/** A labelled field with its error right under it (never only a placeholder). */
export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {children}
      {error ? (
        <span className="text-xs text-error">{error}</span>
      ) : hint ? (
        <span className="text-xs text-foreground-muted">{hint}</span>
      ) : null}
    </div>
  );
}

export const chipClass = (active: boolean, disabled = false) =>
  cn(
    "rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
    active ? "bg-primary text-primary-foreground" : "bg-surface-hover text-foreground",
    disabled && "opacity-40"
  );

export const cardClass = "flex flex-col gap-4 rounded-[20px] bg-surface p-4";

export function StepTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      {description ? <p className="text-sm leading-6 text-foreground-muted">{description}</p> : null}
    </div>
  );
}

/** «حذف …» that asks first — nothing in the wizard is removed by one stray tap. */
export function RemoveButton({
  label,
  title,
  description,
  onConfirm,
}: {
  label: string;
  title: string;
  description?: string;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="self-start text-sm font-semibold text-error">
        {label}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              انصراف
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-error hover:bg-error-background"
              onClick={() => {
                setOpen(false);
                onConfirm();
              }}
            >
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
