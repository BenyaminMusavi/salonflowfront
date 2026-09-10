"use client";

import { getServiceTypeIcon } from "@/shared/data/serviceTypeIcons";
import { useDragScroll } from "@/shared/hooks";
import { IServiceType } from "@/services/domains/service-type/types/service-type.type";

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
  const scrollRef = useDragScroll<HTMLDivElement>();

  return (
    <div className="px-safe-area">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-foreground">دسته‌بندی‌ها</h2>
      </div>

      {isLoading && (
        <p className="text-[13px] text-foreground-muted">در حال بارگذاری…</p>
      )}

      <div
        ref={scrollRef}
        className="no-scrollbar flex touch-pan-x select-none gap-4 overflow-x-auto"
      >
        {categories.map((cat) => {
          const selected = selectedId != null && String(selectedId) === String(cat.id);
          const CategoryIcon = getServiceTypeIcon(cat.name);
          return (
            <button
              key={String(cat.id)}
              type="button"
              onClick={() => onSelect(selected ? null : cat.id)}
              className="flex shrink-0 flex-col items-center gap-2"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full bg-surface-brand text-content-brand ${
                  selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                }`}
              >
                <CategoryIcon size={22} weight="duotone" />
              </div>
              <span className="w-14 truncate text-center text-[11px] text-foreground-muted">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
