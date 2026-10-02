"use client";

import { useEffect } from "react";
import { cn } from "@/shared/utils/className";

export type DashboardToastState = {
  type: "success" | "error";
  message: string;
  /** e.g. «بازگردانی» after check-in / complete. */
  action?: { label: string; onClick: () => void };
} | null;

export function DashboardToast({
  toast,
  onDismiss,
}: {
  toast: DashboardToastState;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    // Give an undo a little longer than a plain message.
    const timer = window.setTimeout(onDismiss, toast.action ? 6000 : 3200);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      role="status"
      className={cn(
        "fixed bottom-24 left-1/2 z-50 flex w-[min(100%-2rem,560px)] -translate-x-1/2 items-center gap-3 rounded-[16px] px-4 py-3 text-sm font-medium shadow-lg",
        toast.type === "success"
          ? "bg-primary text-primary-foreground"
          : "bg-error text-error-foreground"
      )}
    >
      <span className="flex-1">{toast.message}</span>
      {toast.action ? (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick();
            onDismiss();
          }}
          className="shrink-0 rounded-full bg-background/20 px-3 py-1 text-xs font-bold"
        >
          {toast.action.label}
        </button>
      ) : null}
    </div>
  );
}
