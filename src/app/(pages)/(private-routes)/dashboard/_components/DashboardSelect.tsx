"use client";

import { cn } from "@/shared/utils/className";

export function DashboardSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-12 w-full rounded-[2px] border border-input-border bg-input px-3 text-sm text-foreground",
        "hover:bg-input-hover focus:border-border-strong focus:outline-none focus:inset-ring-2 focus:inset-ring-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
