"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import HomeSalonsCard from "@/app/(pages)/(main-pages)/(home)/components/home-salons/components/HomeSalonsCard";
import barbershop from "@/shared/assets/images/barbershop.png";
import { useQueryApprovedSalons } from "@/services/domains/salons/hooks/useQueryApprovedSalons";
import { useToggleFavorite } from "@/services/domains/favorites/hooks/useToggleFavorite";
import { RouteAddress } from "@/shared/data/routeAddress";
import { salonImageSrc } from "@/shared/utils/salonDisplay";

function HomeSalonSlide({
  id,
  salonId,
  name,
  address,
  imageUrl,
  rating,
}: {
  id: string;
  salonId?: number | null;
  name: string;
  address: string;
  imageUrl?: string | null;
  rating: number;
}) {
  const numericId = typeof salonId === "number" ? salonId : undefined;
  const { isFavorite, canToggle, isPending, toggle } =
    useToggleFavorite(numericId);

  return (
    <HomeSalonsCard
      href={RouteAddress.SALONS.DETAILS(id)}
      name={name}
      address={address}
      image={salonImageSrc(imageUrl, barbershop.src)}
      rating={rating}
      saved={isFavorite}
      canFavorite={canToggle}
      onToggleFavorite={toggle}
      favoritePending={isPending}
    />
  );
}

function HomeSalons() {
  const { data, isLoading, isError } = useQueryApprovedSalons({
    page: 1,
    pageSize: 8,
  });

  const salons = data?.data?.items ?? [];

  return (
    <div className="flex flex-col gap-y-3 px-safe-area">
      <span className="text-[24px] font-bold text-white">آرایشگرتو پیدا کن</span>
      <div>
        {isLoading && (
          <div className="flex h-[280px] items-center justify-center rounded-[32px] bg-surface text-sm text-foreground-muted">
            در حال بارگذاری سالن‌ها…
          </div>
        )}

        {isError && (
          <div className="flex h-[280px] items-center justify-center rounded-[32px] bg-surface text-sm text-error">
            خطا در دریافت سالن‌ها
          </div>
        )}

        {!isLoading && !isError && salons.length === 0 && (
          <div className="flex h-[280px] items-center justify-center rounded-[32px] bg-surface text-sm text-foreground-muted">
            سالنی یافت نشد
          </div>
        )}

        {salons.length > 0 && (
          <Swiper
            modules={[Pagination]}
            slidesPerView={1}
            spaceBetween={12}
            pagination={{ clickable: true }}
            className="home-swiper"
          >
            {salons.map((salon) => (
              <SwiperSlide key={salon.id}>
                <HomeSalonSlide
                  id={salon.id}
                  salonId={salon.salonId}
                  name={salon.name}
                  address={
                    [salon.genderType, salon.services]
                      .filter(Boolean)
                      .join(" · ") || "—"
                  }
                  imageUrl={salon.imageUrl}
                  rating={salon.rating ?? 0}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </div>
  );
}

export default HomeSalons;
