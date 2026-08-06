"use client";

import { BookmarkSimpleIcon, StarIcon } from "@phosphor-icons/react";

interface SalonsDetailIdentityProps {
  name: string;
  rating?: number | null;
  isFavorite?: boolean;
  canFavorite?: boolean;
  favoritePending?: boolean;
  onToggleFavorite?: () => void;
}

export default function SalonsDetailIdentity({
  name,
  rating,
  isFavorite = false,
  canFavorite = false,
  favoritePending = false,
  onToggleFavorite,
}: SalonsDetailIdentityProps) {
  return (
    <div className="flex items-start justify-between gap-4 px-safe-area -mt-2">
      <h1 className="text-2xl font-bold text-foreground">{name}</h1>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          disabled={!canFavorite || favoritePending}
          onClick={onToggleFavorite}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface disabled:opacity-40"
          aria-label={
            isFavorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"
          }
          title={
            canFavorite
              ? undefined
              : "شناسه عددی سالن برای علاقه‌مندی در دسترس نیست"
          }
        >
          <BookmarkSimpleIcon
            size={18}
            weight={isFavorite ? "fill" : "regular"}
            className="text-foreground"
          />
        </button>
        <div className="flex items-center gap-1 rounded-full bg-surface px-3 py-1.5">
          <StarIcon size={16} className="text-orange-400" weight="fill" />
          <span className="text-sm font-medium text-foreground">
            {(rating ?? 0).toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
