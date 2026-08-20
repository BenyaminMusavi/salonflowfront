"use client";

import { useState } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { cn } from "@/shared/utils/className";
import { DashboardCard } from "./DashboardCard";

export function DashboardAccordion({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <DashboardCard className="p-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-right"
        aria-expanded={open}
      >
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
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
