"use client";

import { ListIcon, MapTrifoldIcon } from "@phosphor-icons/react";
import { cn } from "@/shared/utils/className";

export type TSearchView = "list" | "map";

interface SearchViewToggleProps {
  value: TSearchView;
  onChange: (next: TSearchView) => void;
}

const OPTIONS: { value: TSearchView; label: string; Icon: typeof ListIcon }[] = [
  { value: "list", label: "فهرست", Icon: ListIcon },
  { value: "map", label: "نقشه", Icon: MapTrifoldIcon },
];

/** «فهرست / نقشه». The map code is only downloaded once «نقشه» is picked. */
export default function SearchViewToggle({ value, onChange }: SearchViewToggleProps) {
  return (
    <div className="px-safe-area">
      <div role="tablist" aria-label="نمایش نتایج" className="flex rounded-full bg-background-secondary p-1">
        {OPTIONS.map(({ value: v, label, Icon }) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={value === v}
            onClick={() => onChange(v)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-bold transition-colors",
              value === v ? "bg-primary text-primary-foreground" : "text-foreground-muted"
            )}
          >
            <Icon size={16} weight={value === v ? "fill" : "regular"} aria-hidden />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
