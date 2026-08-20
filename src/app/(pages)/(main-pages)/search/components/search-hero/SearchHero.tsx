"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { ArrowUpLeftIcon, StarIcon } from "@phosphor-icons/react";
import { ISalonCard } from "@/services/domains/salons/types/salons.type";
import { useToggleFavorite } from "@/services/domains/favorites/hooks/useToggleFavorite";
import { RouteAddress } from "@/shared/data/routeAddress";
import { salonImageSrc } from "@/shared/utils/salonDisplay";
import barbershop from "@/shared/assets/images/barbershop.png";
import FavoriteHeartButton from "@/shared/components/composites/favorite-heart/FavoriteHeartButton";

function SearchHeroSlide({ slide }: { slide: ISalonCard }) {
  const { isFavorite, canToggle, isPending, toggle } = useToggleFavorite(
    slide.id
  );

  return (
    <div className="relative h-[180px] w-full overflow-hidden rounded-[28px]">
      <img
        src={salonImageSrc(slide.imageUrl, barbershop.src)}
        alt={slide.name}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-overlay/70 via-overlay/30 to-transparent" />

      <FavoriteHeartButton
        isFavorite={isFavorite}
        disabled={!canToggle}
        pending={isPending}
        onToggle={toggle}
        size={18}
        className="absolute right-3 top-3 z-10 h-9 w-9 bg-overlay/60 backdrop-blur-sm"
      />

      <div className="relative z-10 flex h-full w-3/5 flex-col justify-end gap-2 p-5">
        <span className="text-[11px] text-on-media/70">
          {slide.genderType || slide.services || "سالن"}
        </span>

        <h3 className="text-[18px] font-bold leading-tight text-on-media">
          {slide.name}
        </h3>

        <div className="mt-1 flex items-center gap-2">
          <Link
            href={RouteAddress.SALONS.DETAILS(slide.id)}
            className="rounded-full bg-primary px-5 py-2 text-[12px] font-bold text-primary-foreground"
          >
            رزرو کن
          </Link>

          <Link
            href={RouteAddress.SALONS.DETAILS(slide.id)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <ArrowUpLeftIcon size={16} weight="bold" />
          </Link>
        </div>
      </div>

      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-overlay/60 px-3 py-1.5 backdrop-blur-sm">
        <StarIcon size={14} className="text-rating" weight="fill" />
        <span className="text-[12px] font-semibold text-on-media">
          {(slide.rating ?? 0).toFixed(1)}
        </span>
      </div>
    </div>
  );
}

interface SearchHeroProps {
  salons: ISalonCard[];
}

export default function SearchHero({ salons }: SearchHeroProps) {
  const slides = salons.slice(0, 5);

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full px-safe-area">
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true }}
        loop={slides.length > 1}
        className="home-swiper w-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <SearchHeroSlide slide={slide} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
