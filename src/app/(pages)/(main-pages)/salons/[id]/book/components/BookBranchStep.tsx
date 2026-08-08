"use client";

import { ISalonBranch } from "@/services/domains/salons/types/booking-browse.type";
import { cn } from "@/shared/utils/className";

interface BookBranchStepProps {
  branches: ISalonBranch[];
  selectedBranchPublicId: string | null;
  onSelect: (branch: ISalonBranch) => void;
}

export default function BookBranchStep({
  branches,
  selectedBranchPublicId,
  onSelect,
}: BookBranchStepProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-bold text-foreground">انتخاب شعبه</h2>
      {branches.length === 0 ? (
        <div className="rounded-2xl bg-surface px-4 py-6 text-center">
          <p className="text-sm text-foreground-muted">
            برای این سالن شعبه‌ای ثبت نشده است.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {branches.map((branch) => {
            const selected = selectedBranchPublicId === branch.publicId;
            const location =
              [branch.city, branch.address].filter(Boolean).join("، ") || null;

            return (
              <li key={branch.publicId}>
                <button
                  type="button"
                  onClick={() => onSelect(branch)}
                  className={cn(
                    "flex w-full flex-col gap-1 rounded-2xl px-4 py-3.5 text-right transition",
                    selected
                      ? "bg-primary/10 ring-1 ring-primary"
                      : "bg-surface hover:bg-surface-hover"
                  )}
                >
                  <span className="text-sm font-bold text-foreground">
                    {branch.name}
                  </span>
                  {location ? (
                    <span className="text-xs text-foreground-muted">
                      {location}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
