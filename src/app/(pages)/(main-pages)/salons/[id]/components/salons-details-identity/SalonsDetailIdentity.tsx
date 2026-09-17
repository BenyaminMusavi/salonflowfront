"use client";

import { StarIcon } from "@phosphor-icons/react";
import FavoriteHeartButton from "@/shared/components/composites/favorite-heart/FavoriteHeartButton";
import { salonImageSrc } from "@/shared/utils/salonDisplay";

interface SalonsDetailIdentityProps {
  name: string;
  /** MediaUsageType.Profile — shown here as the salon's logo badge. */
  logoUrl?: string | null;
  rating?: number | null;
  isFavorite?: boolean;
  canFavorite?: boolean;
  favoritePending?: boolean;
  onToggleFavorite?: () => void;
}

function SalonLogoBadge({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  const src = salonImageSrc(logoUrl, "");
  const monogram = (name.trim().charAt(0) || "س").toUpperCase();

  return (
    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border bg-surface">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-base font-bold text-foreground-muted">
          {monogram}
        </div>
      )}
    </div>
  );
}

export default function SalonsDetailIdentity({
  name,
  logoUrl,
  rating,
  isFavorite = false,
  canFavorite = false,
  favoritePending = false,
  onToggleFavorite,
}: SalonsDetailIdentityProps) {
  return (
    <div className="flex items-start justify-between gap-4 px-safe-area -mt-2">
      <div className="flex min-w-0 items-center gap-3">
        <SalonLogoBadge name={name} logoUrl={logoUrl} />
        <h1 className="truncate text-2xl font-bold text-foreground">{name}</h1>
      </div>
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
