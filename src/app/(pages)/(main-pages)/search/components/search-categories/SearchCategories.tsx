"use client";

import Image from "next/image";
import { IServiceType } from "@/services/domains/service-type/types/service-type.type";
import { salonImageSrc } from "@/shared/utils/salonDisplay";

const FALLBACK_COLORS = [
  "bg-gradient-to-br from-border-hover to-background-elevated",
  "bg-gradient-to-br from-border-strong to-border",
  "bg-gradient-to-br from-border-hover to-background-secondary",
  "bg-gradient-to-br from-border-strong to-background-elevated",
  "bg-gradient-to-br from-border-hover to-border",
];

interface SearchCategoriesProps {
  categories: IServiceType[];
  selectedId?: string | number | null;
  onSelect: (id: string | number | null) => void;
  isLoading?: boolean;
}

export default function SearchCategories({
  categories,
  selectedId,
  onSelect,
  isLoading,
}: SearchCategoriesProps) {
  return (
    <div className="px-safe-area">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-foreground">دسته‌بندی‌ها</h2>
      </div>

      {isLoading && (
        <p className="text-[13px] text-foreground-muted">در حال بارگذاری…</p>
      )}

      <div className="no-scrollbar flex gap-4 overflow-x-auto">
        {categories.map((cat, i) => {
          const selected = selectedId != null && String(selectedId) === String(cat.id);
          return (
            <button
              key={String(cat.id)}
              type="button"
              onClick={() => onSelect(selected ? null : cat.id)}
              className="flex shrink-0 flex-col items-center gap-2"
            >
              <div
                className={`relative h-[68px] w-[68px] overflow-hidden rounded-full ${
                  FALLBACK_COLORS[i % FALLBACK_COLORS.length]
                } ${selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
              >
                {cat.imageUrl && (
                  <Image
                    src={salonImageSrc(cat.imageUrl, "")}
                    alt={cat.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                )}
              </div>
              <span className="w-[68px] truncate text-center text-[11px] text-foreground-muted">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
