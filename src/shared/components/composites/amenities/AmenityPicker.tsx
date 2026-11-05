"use client";

import { CheckIcon } from "@phosphor-icons/react";
import { useQueryAmenities } from "@/services/domains/amenities/hooks/useQueryAmenities";
import {
  AMENITY_CATEGORY_LABELS,
  AmenityCategory,
  type IAmenity,
} from "@/services/domains/amenities/types/amenities.type";
import AmenityIcon from "./AmenityIcon";
import { cn } from "@/shared/utils/className";

interface AmenityPickerProps {
  /** Selected amenity keys. */
  value: string[];
  onChange: (keys: string[]) => void;
  /** Smaller chips for the dashboard sheet (same size as its other chips). */
  compact?: boolean;
}

const CATEGORY_ORDER = [AmenityCategory.Refreshments, AmenityCategory.Comfort, AmenityCategory.Access];

/** «امکانات سالن» — multi-select, grouped by category. Only the active catalog is offered. */
export default function AmenityPicker({ value, onChange, compact = false }: AmenityPickerProps) {
  const { data, isLoading, isError } = useQueryAmenities();
  const amenities = data?.data ?? [];

  if (isLoading) return <p className="text-xs text-foreground-muted">در حال بارگذاری امکانات…</p>;
  if (isError) return <p className="text-xs text-error">دریافت فهرست امکانات ناموفق بود.</p>;
  if (!amenities.length) return null;

  const selected = new Set(value);
  const toggle = (key: string) =>
    onChange(selected.has(key) ? value.filter((k) => k !== key) : [...value, key]);

  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    items: amenities.filter((a: IAmenity) => a.category === category),
  })).filter((g) => g.items.length);

  return (
    <div className="flex flex-col gap-3">
      {groups.map((g) => (
        <div key={g.category} role="group" aria-label={AMENITY_CATEGORY_LABELS[g.category]} className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-foreground-muted">{AMENITY_CATEGORY_LABELS[g.category]}</span>
          <div className="flex flex-wrap gap-2">
            {g.items.map((a) => {
              const checked = selected.has(a.key);
              return (
                <button
                  key={a.key}
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => toggle(a.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full font-semibold transition-colors",
                    compact ? "px-3 py-1.5 text-xs" : "px-3.5 py-2 text-sm",
                    checked ? "bg-primary text-primary-foreground" : "bg-surface-hover text-foreground"
                  )}
                >
                  {checked ? (
                    <CheckIcon size={compact ? 14 : 16} weight="bold" aria-hidden />
                  ) : (
                    <AmenityIcon amenityKey={a.key} size={compact ? 14 : 16} />
                  )}
                  {a.title}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
