"use client";

import type { ISalonBranch } from "@/services/domains/salons/types/booking-browse.type";
import { cn } from "@/shared/utils/className";

interface SalonsDetailBranchPickerProps {
  /** Active branches only. */
  branches: ISalonBranch[];
  selectedPublicId: string | null;
  onSelect: (publicId: string) => void;
}

/** One branch choice for the page: «خدمات» (prices) and «امکانات و رفاه» both follow it. Hidden for a single-branch salon. */
export default function SalonsDetailBranchPicker({ branches, selectedPublicId, onSelect }: SalonsDetailBranchPickerProps) {
  if (branches.length < 2) return null;

  return (
    <div className="mt-6 px-safe-area">
      <p className="mb-2 text-xs font-semibold text-foreground-muted">شعبه</p>
      <div role="tablist" aria-label="شعبه" className="no-scrollbar -mx-safe-area flex gap-2 overflow-x-auto px-safe-area">
        {branches.map((b) => {
          const active = b.publicId === selectedPublicId;
          return (
            <button
              key={b.publicId}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(b.publicId)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                active ? "bg-primary text-primary-foreground" : "bg-surface text-foreground-muted"
              )}
            >
              {b.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
