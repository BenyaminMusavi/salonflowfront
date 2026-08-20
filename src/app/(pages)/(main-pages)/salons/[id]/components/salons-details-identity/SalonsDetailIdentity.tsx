"use client";

import { StarIcon } from "@phosphor-icons/react";
import FavoriteHeartButton from "@/shared/components/composites/favorite-heart/FavoriteHeartButton";

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
        <FavoriteHeartButton
          isFavorite={isFavorite}
          disabled={!canFavorite}
          pending={favoritePending}
          onToggle={onToggleFavorite}
          size={18}
          className="h-9 w-9 bg-surface"
          iconClassName={isFavorite ? "text-error" : "text-foreground"}
        />
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
