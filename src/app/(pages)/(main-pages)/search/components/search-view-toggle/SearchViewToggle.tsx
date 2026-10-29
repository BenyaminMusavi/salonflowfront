"use client";

import { ListIcon, MapTrifoldIcon } from "@phosphor-icons/react";
import { cn } from "@/shared/utils/className";

export type TSearchView = "list" | "map";

interface SearchViewToggleProps {
  value: TSearchView;
  onChange: (next: TSearchView) => void;
  className?: string;
}

const OPTIONS: { value: TSearchView; label: string; Icon: typeof ListIcon }[] = [
  { value: "list", label: "فهرست", Icon: ListIcon },
  { value: "map", label: "نقشه", Icon: MapTrifoldIcon },
];

/** «فهرست / نقشه» — how the results are shown. The map code is only downloaded once «نقشه» is picked. */
export default function SearchViewToggle({ value, onChange, className }: SearchViewToggleProps) {
  return (
    <div role="tablist" aria-label="نمایش نتایج" className={cn("flex rounded-full bg-background-secondary p-1", className)}>
      {OPTIONS.map(({ value: v, label, Icon }) => (
        <button
          key={v}
          type="button"
          role="tab"
          aria-selected={value === v}
          onClick={() => onChange(v)}
          className={cn(
            "flex flex-1 items-center justify-center gap-1 rounded-full px-2.5 py-2 text-[12px] font-bold sm:gap-1.5 sm:px-3.5 sm:text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary",
            value === v ? "bg-primary text-primary-foreground" : "text-foreground-muted hover:text-foreground"
          )}
        >
          <Icon size={16} weight={value === v ? "fill" : "regular"} aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}
