"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import barbershop from "@/shared/assets/images/barbershop.png";
import { salonImageSrc } from "@/shared/utils/salonDisplay";
import { ISalon, ISalonGalleryItem } from "@/services/domains/salons/types/salon.type";

function resolveGallery(salon: ISalon): string[] {
  const fromGallery =
    salon.gallery
      ?.map((item) => {
        if (typeof item === "string") return item;
        const g = item as ISalonGalleryItem;
        return g.url || g.imageUrl || "";
      })
      .filter(Boolean) ?? [];

  const cover = salon.coverImageUrl || salon.imageUrl;
  if (fromGallery.length > 0) return fromGallery;
  if (cover) return [cover];
  return [barbershop.src];
}

interface SalonsDetailHeroProps {
  salon: ISalon;
}

export default function SalonsDetailHero({ salon }: SalonsDetailHeroProps) {
  const images = resolveGallery(salon);

  return (
    <div className="relative w-full overflow-hidden">
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true }}
        loop={images.length > 1}
        className="h-full w-full home-swiper"
      >
        {images.map((img, i) => {
          const src = salonImageSrc(img, barbershop.src);
          return (
            <SwiperSlide key={`${src}-${i}`}>
              <div className="relative h-[35vh] w-full">
                <Image
                  src={src}
                  alt={`${salon.name}-${i}`}
                  fill
                  unoptimized={/^https?:\/\//i.test(src)}
                  className="object-cover"
                  priority={i === 0}
                />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
