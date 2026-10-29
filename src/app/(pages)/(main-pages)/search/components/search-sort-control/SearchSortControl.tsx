"use client";

import { cn } from "@/shared/utils/className";

/**
 * «پیشنهادی» = the default order (the API's own order; nearest first while «نزدیک‌ترین به من» is on).
 * «جدیدترین» = `sort=newest`: the most recently registered salon first. Kept in the URL so it survives category, filter and
 * list/map changes.
 */
export type TSearchSort = "recommended" | "newest";

interface SearchSortControlProps {
  value: TSearchSort;
  onChange: (next: TSearchSort) => void;
  className?: string;
}

const OPTIONS: { value: TSearchSort; label: string }[] = [
  { value: "recommended", label: "پیشنهادی" },
  { value: "newest", label: "جدیدترین" },
];

export default function SearchSortControl({ value, onChange, className }: SearchSortControlProps) {
  return (
    <div role="radiogroup" aria-label="ترتیب نمایش سالن‌ها" className={cn("flex rounded-full bg-background-secondary p-1", className)}>
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "min-w-0 flex-1 truncate rounded-full px-2 py-2 text-[12px] font-semibold sm:px-3 sm:text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary",
              active ? "bg-primary/15 text-primary ring-1 ring-primary" : "text-foreground-muted hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
