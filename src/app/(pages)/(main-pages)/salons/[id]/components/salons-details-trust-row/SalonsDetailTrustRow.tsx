"use client";

import { ClockIcon, MapPinIcon } from "@phosphor-icons/react";

interface SalonsDetailTrustRowProps {
  location?: string | null;
  openStatus?: string | null;
  /** When set, the address becomes a button that opens the directions sheet. */
  onOpenDirections?: () => void;
}

export default function SalonsDetailTrustRow({
  location,
  openStatus,
  onOpenDirections,
}: SalonsDetailTrustRowProps) {
  if (!location && !openStatus) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 px-safe-area">
      {location ? (
        <button
          type="button"
          onClick={onOpenDirections}
          disabled={!onOpenDirections}
          aria-label={onOpenDirections ? "مسیریابی تا سالن" : undefined}
          className="flex min-w-0 items-center gap-2 text-right disabled:cursor-default"
        >
          <MapPinIcon
            size={16}
            className={onOpenDirections ? "shrink-0 text-primary" : "shrink-0 text-foreground-muted"}
          />
          <span
            className={
              onOpenDirections
                ? "truncate text-sm text-foreground-muted underline decoration-dotted underline-offset-4"
                : "truncate text-sm text-foreground-muted"
            }
          >
            {location}
          </span>
        </button>
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
