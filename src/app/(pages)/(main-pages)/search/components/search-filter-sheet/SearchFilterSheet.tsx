"use client";

import { useEffect, useState } from "react";
import { StarIcon, NavigationArrowIcon } from "@phosphor-icons/react";
import BottomSheet from "@/shared/components/composites/bottom-sheet/BottomSheet";
import { GenderType } from "@/services/common/enums/domain-enums";
import { cn } from "@/shared/utils/className";

export interface ISearchFilters {
  minPrice: string;
  maxPrice: string;
  minRating: number | null;
  genderType: GenderType | null;
}

export const EMPTY_SEARCH_FILTERS: ISearchFilters = {
  minPrice: "",
  maxPrice: "",
  minRating: null,
  genderType: null,
};

const GENDER_OPTIONS: { value: GenderType; label: string }[] = [
  { value: GenderType.Female, label: "بانوان" },
  { value: GenderType.Male, label: "آقایان" },
  { value: GenderType.Mixed, label: "مختلط" },
];

interface SearchFilterSheetProps {
  open: boolean;
  onClose: () => void;
  filters: ISearchFilters;
  onApply: (filters: ISearchFilters) => void;
  /** Whether "نزدیک‌ترین به من" is currently on (lat/lng resolved). */
  useMyLocation: boolean;
  onToggleMyLocation: (next: boolean) => void;
  locationError?: string | null;
  locationLoading?: boolean;
}

const chipClass = (active: boolean) =>
  cn(
    "rounded-full px-4 py-2 text-sm font-semibold transition",
    active ? "bg-primary text-primary-foreground" : "bg-background-secondary text-foreground"
  );

const fieldClass =
  "w-full rounded-2xl bg-input border border-input-border px-3 py-2 text-sm text-foreground outline-none placeholder:text-input-placeholder hover:bg-input-hover focus:bg-input-focus focus:border-border-strong";

export default function SearchFilterSheet({
  open,
  onClose,
  filters,
  onApply,
  useMyLocation,
  onToggleMyLocation,
  locationError,
  locationLoading,
}: SearchFilterSheetProps) {
  const [draft, setDraft] = useState<ISearchFilters>(filters);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const handleReset = () => {
    setDraft(EMPTY_SEARCH_FILTERS);
    onApply(EMPTY_SEARCH_FILTERS);
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex flex-col gap-5 pb-4">
        <h3 className="text-base font-bold text-foreground">فیلترها</h3>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-foreground">جنسیت خدمات</span>
          <div className="flex flex-wrap gap-2">
            {GENDER_OPTIONS.map((opt) => {
              const active = draft.genderType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      genderType: active ? null : opt.value,
                    }))
                  }
                  className={chipClass(active)}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-foreground">محدوده قیمت (تومان)</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="حداقل"
              value={draft.minPrice}
              onChange={(e) =>
                setDraft((d) => ({ ...d, minPrice: e.target.value }))
              }
              className={fieldClass}
            />
            <span className="text-foreground-muted">تا</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="حداکثر"
              value={draft.maxPrice}
              onChange={(e) =>
                setDraft((d) => ({ ...d, maxPrice: e.target.value }))
              }
              className={fieldClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-foreground">حداقل امتیاز</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => {
              const active = (draft.minRating ?? 0) >= n;
              return (
                <button
                  key={n}
                  type="button"
                  aria-label={`حداقل ${n} ستاره`}
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      minRating: d.minRating === n ? null : n,
                    }))
                  }
                  className="p-1"
                >
                  <StarIcon
                    size={26}
                    weight={active ? "fill" : "regular"}
                    className={active ? "text-rating" : "text-foreground-muted"}
                  />
                </button>
              );
            })}
            {draft.minRating != null && (
              <span className="ms-2 text-xs text-foreground-muted">
                {draft.minRating} ستاره به بالا
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-foreground">فاصله</span>
          <button
            type="button"
            disabled={locationLoading}
            onClick={() => onToggleMyLocation(!useMyLocation)}
            className={cn(
              "flex items-center justify-between gap-3 rounded-[16px] p-4 text-right transition disabled:opacity-60",
              useMyLocation ? "bg-primary/15 ring-1 ring-primary" : "bg-background-secondary"
            )}
          >
            <span className="flex items-center gap-2">
              <NavigationArrowIcon size={18} className="text-primary" />
              <span className="text-sm font-bold text-foreground">
                {locationLoading ? "در حال دریافت موقعیت…" : "نزدیک‌ترین به من"}
              </span>
            </span>
            <span
              className={cn(
                "h-5 w-9 rounded-full transition-colors",
                useMyLocation ? "bg-primary" : "bg-background-tertiary"
              )}
            >
              <span
                className={cn(
                  "block h-5 w-5 rounded-full bg-surface-white shadow transition-transform",
                  useMyLocation ? "-translate-x-4" : "translate-x-0"
                )}
              />
            </span>
          </button>
          {locationError && (
            <p className="text-xs text-error">{locationError}</p>
          )}
        </div>

        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 rounded-full bg-background-secondary py-3 text-sm font-bold text-foreground"
          >
            حذف فیلترها
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground"
          >
            اعمال فیلتر
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
