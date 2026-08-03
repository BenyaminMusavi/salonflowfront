"use client";

import { BookmarkSimpleIcon, MapPinIcon, StarIcon } from "@phosphor-icons/react";
import { formatToman } from "@/shared/utils/salonDisplay";
import { ISalon } from "@/services/domains/salons/types/salon.type";

interface SalonsDetailInfoProps {
  salon: ISalon;
  isFavorite?: boolean;
  canFavorite?: boolean;
  favoritePending?: boolean;
  onToggleFavorite?: () => void;
}

export default function SalonsDetailInfo({
  salon,
  isFavorite = false,
  canFavorite = false,
  favoritePending = false,
  onToggleFavorite,
}: SalonsDetailInfoProps) {
  const location =
    [salon.city, salon.address].filter(Boolean).join("، ") || "—";

  return (
    <div className="px-safe-area mt-5">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">{salon.name}</h1>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            disabled={!canFavorite || favoritePending}
            onClick={onToggleFavorite}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/10 disabled:opacity-40"
            aria-label={isFavorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
            title={
              canFavorite
                ? undefined
                : "شناسه عددی سالن برای علاقه‌مندی در دسترس نیست"
            }
          >
            <BookmarkSimpleIcon
              size={18}
              weight={isFavorite ? "fill" : "regular"}
              className="text-white"
            />
          </button>
          <div className="flex items-center gap-1 rounded-full bg-foreground/10 px-3 py-1.5">
            <StarIcon size={16} className="text-orange-400" weight="fill" />
            <span className="text-sm font-medium text-white">
              {(salon.rating ?? 0).toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {salon.description && (
        <p className="mt-3 text-sm leading-6 text-foreground-muted">
          {salon.description}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <MapPinIcon size={16} className="text-foreground-muted" />
        <span className="text-sm text-foreground-muted">{location}</span>
      </div>

      {salon.minPrice != null && (
        <div className="mt-2 flex items-center gap-3">
          <span className="text-xl font-bold text-white">
            از {formatToman(salon.minPrice)} تومان
          </span>
        </div>
      )}

      {salon.services && salon.services.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {salon.services.map((s) => (
            <span
              key={s.id}
              className="rounded-full bg-surface-tertiary px-3 py-1 text-xs text-foreground"
            >
              {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
