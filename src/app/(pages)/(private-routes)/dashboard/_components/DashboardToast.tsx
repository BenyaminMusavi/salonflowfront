"use client";

import { useEffect } from "react";
import { cn } from "@/shared/utils/className";

export type DashboardToastState = {
  type: "success" | "error";
  message: string;
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
    const timer = window.setTimeout(onDismiss, 3200);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      role="status"
      className={cn(
        "fixed bottom-24 left-1/2 z-50 w-[min(100%-2rem,560px)] -translate-x-1/2 rounded-[16px] px-4 py-3 text-sm font-medium shadow-lg",
        toast.type === "success"
          ? "bg-primary text-primary-foreground"
          : "bg-error text-error-foreground"
      )}
    >
      {toast.message}
    </div>
  );
}
