"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpLeftIcon, StarIcon } from "@phosphor-icons/react";
import { ISalonCard } from "@/services/domains/salons/types/salons.type";
import { useToggleFavorite } from "@/services/domains/favorites/hooks/useToggleFavorite";
import { RouteAddress } from "@/shared/data/routeAddress";
import { formatToman, salonImageSrc } from "@/shared/utils/salonDisplay";
import barbershop from "@/shared/assets/images/barbershop.png";
import FavoriteHeartButton from "@/shared/components/composites/favorite-heart/FavoriteHeartButton";

function SearchSalonCard({ salon }: { salon: ISalonCard }) {
  const image = salonImageSrc(salon.imageUrl, barbershop.src);
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

      <div className="absolute left-2 top-2 z-10 flex items-center gap-1.5 rounded-full bg-overlay/60 px-2.5 py-1 backdrop-blur-sm">
        <StarIcon size={12} weight="fill" className="text-rating" />
        <span className="text-[11px] font-semibold text-on-media">
          {(salon.rating ?? 0).toFixed(1)}
        </span>
        {salon.distanceKm != null && (
          <>
            <span className="h-1 w-1 rounded-full bg-on-media/50" />
            <span className="text-[11px] font-semibold text-on-media">
              {salon.distanceKm.toFixed(1)} کیلومتر
            </span>
          </>
        )}
      </div>

      <div className="absolute inset-x-4 bottom-4 z-10 flex items-end justify-between gap-2">
        <div className="min-w-0">
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
}

export default function SearchCardGrid({
  salons,
  isLoading,
  isError,
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
        سالنی با این فیلترها یافت نشد
      </p>
    );
  }

  return (
    <div className="px-safe-area">
      <div className="grid grid-cols-2 gap-3">
        {salons.map((salon) => (
          <SearchSalonCard key={salon.id} salon={salon} />
        ))}
      </div>
    </div>
  );
}
