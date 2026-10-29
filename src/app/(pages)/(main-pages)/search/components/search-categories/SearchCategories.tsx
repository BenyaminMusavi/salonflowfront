"use client";

import { getServiceTypeIcon } from "@/shared/data/serviceTypeIcons";
import { useDragScroll } from "@/shared/hooks";
import MarqueeLabel from "@/shared/components/composites/marquee-label/MarqueeLabel";
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
        // overflow-x:auto makes overflow-y clip too, and the selection ring (box-shadow: 2px ring + 2px offset) is painted OUTSIDE the
        // 56px circle — so it was cut off at the scroller's edges. The padding gives the ring room; the negative margin keeps the layout.
        className="no-scrollbar -m-2 flex touch-pan-x select-none gap-4 overflow-x-auto p-2"
      >
        {categories.map((cat) => {
          const selected = selectedId != null && String(selectedId) === String(cat.id);
          const CategoryIcon = getServiceTypeIcon(cat.name);
          return (
            <button
              key={String(cat.id)}
              type="button"
              onClick={() => onSelect(selected ? null : cat.id)}
              aria-pressed={selected}
              className="group flex shrink-0 flex-col items-center gap-2 outline-none"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full bg-surface-brand text-content-brand transition-shadow group-hover:ring-2 group-hover:ring-primary/40 group-hover:ring-offset-2 group-hover:ring-offset-background group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background ${
                  selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                }`}
              >
                <CategoryIcon size={22} weight="duotone" />
              </div>
              {/* Same 56px box as before (never two lines). A title that fits stays still and complete; only a really longer one glides. */}
              <MarqueeLabel
                text={cat.name}
                className={`w-14 text-center text-[11px] ${selected ? "font-bold text-foreground" : "text-foreground-muted"}`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
