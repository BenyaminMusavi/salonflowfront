"use client";

import { useEffect } from "react";
import { cn } from "@/shared/utils/className";

export type SalonInfoToastState = {
  type: "success" | "error";
  message: string;
} | null;

interface SalonInfoToastProps {
  toast: SalonInfoToastState;
  onDismiss: () => void;
}

export default function SalonInfoToast({
  toast,
  onDismiss,
}: SalonInfoToastProps) {
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
        "fixed bottom-4 left-1/2 z-50 w-[min(100%-2rem,560px)] -translate-x-1/2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg",
        toast.type === "success"
          ? "bg-primary text-primary-foreground"
          : "bg-error text-white"
      )}
    >
      {toast.message}
    </div>
  );
}
