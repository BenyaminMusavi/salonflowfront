"use client";

import { ClockIcon, MapPinIcon } from "@phosphor-icons/react";

interface SalonsDetailTrustRowProps {
  location?: string | null;
  openStatus?: string | null;
}

export default function SalonsDetailTrustRow({
  location,
  openStatus,
}: SalonsDetailTrustRowProps) {
  if (!location && !openStatus) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 px-safe-area">
      {location ? (
        <div className="flex min-w-0 items-center gap-2">
          <MapPinIcon size={16} className="shrink-0 text-foreground-muted" />
          <span className="truncate text-sm text-foreground-muted">
            {location}
          </span>
        </div>
      ) : null}
      {openStatus ? (
        <div className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1">
          <ClockIcon size={14} className="text-primary" weight="fill" />
          <span className="text-xs font-medium text-foreground">
            {openStatus}
          </span>
        </div>
      ) : null}
    </div>
  );
}
