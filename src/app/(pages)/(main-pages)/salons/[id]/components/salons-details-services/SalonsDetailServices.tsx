"use client";

import { ISalonServiceSummary } from "@/services/domains/salons/types/salon.type";

interface SalonsDetailServicesProps {
  services?: ISalonServiceSummary[] | null;
}

export default function SalonsDetailServices({
  services,
}: SalonsDetailServicesProps) {
  if (!services?.length) return null;

  return (
    <div className="mt-6 px-safe-area">
      <h2 className="mb-3 text-base font-bold text-foreground">خدمات</h2>
      <div className="no-scrollbar -mx-safe-area flex gap-2 overflow-x-auto px-safe-area">
        {services.map((service) => (
          <span
            key={service.id}
            className="shrink-0 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-foreground"
          >
            {service.name}
          </span>
        ))}
      </div>
    </div>
  );
}
