"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpLeftIcon, MapPinIcon } from "@phosphor-icons/react";
import RatingValue from "@/shared/components/composites/rating/RatingValue";
import { ISalonCard } from "@/services/domains/salons/types/salons.type";
import { useToggleFavorite } from "@/services/domains/favorites/hooks/useToggleFavorite";
import { RouteAddress } from "@/shared/data/routeAddress";
import { formatToman, salonImageSrc } from "@/shared/utils/salonDisplay";
import barbershop from "@/shared/assets/images/barbershop.png";
import { formatDistanceKm } from "@/shared/utils/distance";
import GenderAudienceBadge from "@/shared/components/composites/gender-audience-badge/GenderAudienceBadge";
import { cn } from "@/shared/utils/className";
import FavoriteHeartButton from "@/shared/components/composites/favorite-heart/FavoriteHeartButton";

function SearchSalonCard({ salon, onShowOnMap }: { salon: ISalonCard; onShowOnMap?: (salon: ISalonCard) => void }) {
  const image = salonImageSrc(
    salon.coverImageUrl ?? salon.imageUrl,
    barbershop.src
  );
  const { isFavorite, canToggle, isPending, toggle } = useToggleFavorite(
    salon.id
  );

  return (
    <Link
      href={RouteAddress.SALONS.DETAILS(salon.id)}
      className="relative h-52 overflow-hidden rounded-[20px]"
    >
      <Image
        src={image}
        alt={salon.name}
        fill
        unoptimized={/^https?:\/\//i.test(image)}
        className="object-cover"
        sizes="(max-width:768px) 50vw, 25vw"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-overlay/80 via-overlay/20 to-transparent" />

      <FavoriteHeartButton
        isFavorite={isFavorite}
        disabled={!canToggle}
        pending={isPending}
        onToggle={toggle}
        size={16}
        className="absolute right-2 top-2 z-10 h-8 w-8 bg-overlay/60 backdrop-blur-sm"
      />

      {onShowOnMap && salon.latitude != null && salon.longitude != null ? (
        <button
          type="button"
          aria-label={`نمایش ${salon.name} روی نقشه`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onShowOnMap(salon);
          }}
          className="absolute right-2 top-12 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-overlay/60 text-on-media backdrop-blur-sm"
        >
          <MapPinIcon size={16} weight="bold" />
        </button>
      ) : null}

      <div className="absolute left-2 top-2 z-10 flex items-center gap-1.5 rounded-full bg-overlay/60 px-2.5 py-1 backdrop-blur-sm">
        <RatingValue
          rating={salon.rating}
          reviewCount={salon.reviewCount}
          textClassName="text-[11px] font-semibold text-on-media"
        />
        {formatDistanceKm(salon.distanceKm) && (
          <>
            <span className="h-1 w-1 rounded-full bg-on-media/50" />
            <span className="text-[11px] font-semibold text-on-media">
              {/* خط مستقیم، نه مسافت رانندگی */}
              {"≈ "}
              {formatDistanceKm(salon.distanceKm)}
            </span>
          </>
        )}
      </div>

      <div className="absolute inset-x-4 bottom-4 z-10 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <GenderAudienceBadge audience={salon.genderAudience} className="mb-0.5 text-on-media/90" />
          <h4 className="truncate text-[14px] font-bold text-on-media">
            {salon.name}
          </h4>
          {salon.minPrice != null && (
            <p className="mt-0.5 truncate text-[11px] text-on-media/80">
              شروع از {formatToman(salon.minPrice)} تومان
            </p>
          )}
        </div>

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground backdrop-blur-sm">
          <ArrowUpLeftIcon size={15} weight="bold" />
        </span>
      </div>
    </Link>
  );
}

interface SearchCardGridProps {
  salons: ISalonCard[];
  isLoading?: boolean;
  isError?: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  /** A radius filter is on, so an empty list means «nothing nearby», not «no match». */
  withinRadius?: boolean;
  /** The list on screen is the previous query's while a new filter loads: dim it and block taps so it is never mistaken for the new result. */
  isStale?: boolean;
  /** Shown on cards that have a branch with coordinates: switches to the map with that branch selected. */
  onShowOnMap?: (salon: ISalonCard) => void;
}

export default function SearchCardGrid({
  salons,
  isLoading,
  isError,
  hasMore,
  isLoadingMore,
  onLoadMore,
  withinRadius,
  isStale,
  onShowOnMap,
}: SearchCardGridProps) {
  if (isLoading) {
    return (
      <p className="px-safe-area text-[13px] text-foreground-muted">
        در حال بارگذاری سالن‌ها…
      </p>
    );
  }

  if (isError) {
    return (
      <p className="px-safe-area text-[13px] text-error">
        خطا در دریافت لیست سالن‌ها
      </p>
    );
  }

  if (salons.length === 0) {
    return (
      <p className="px-safe-area text-[13px] text-foreground-muted">
        {withinRadius
          ? "در این شعاع سالنی پیدا نشد؛ شعاع را بیشتر کنید یا حذفش کنید."
          : "سالنی با این فیلترها یافت نشد"}
      </p>
    );
  }

  return (
    <div className="px-safe-area" aria-busy={isStale || undefined}>
      <div className={cn("grid grid-cols-2 gap-3 transition-opacity", isStale && "pointer-events-none opacity-50")}>
        {salons.map((salon) => (
          <SearchSalonCard key={salon.id} salon={salon} onShowOnMap={onShowOnMap} />
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={isLoadingMore || isStale}
          className="mt-4 w-full rounded-full bg-background-secondary py-3 text-sm font-bold text-foreground disabled:opacity-60"
        >
          {isLoadingMore ? "در حال بارگذاری…" : "نمایش بیشتر"}
        </button>
      )}
    </div>
  );
}
