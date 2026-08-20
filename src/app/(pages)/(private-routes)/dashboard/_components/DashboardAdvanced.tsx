"use client";

import { useState } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { cn } from "@/shared/utils/className";
import { DashboardCard } from "./DashboardCard";

export function DashboardAdvanced({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <DashboardCard className="p-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-right"
        aria-expanded={open}
      >
        <div>
          <p className="text-sm font-bold text-foreground">{title}</p>
          <p className="mt-0.5 text-[11px] text-foreground-muted">
            تنظیمات پیشرفته
          </p>
        </div>
        <CaretDownIcon
          size={16}
          className={cn(
            "shrink-0 text-foreground-muted transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open ? <div className="border-t border-border px-4 py-3">{children}</div> : null}
    </DashboardCard>
  );
}
