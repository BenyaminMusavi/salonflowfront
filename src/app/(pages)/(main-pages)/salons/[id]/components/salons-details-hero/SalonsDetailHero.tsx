"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { salonImageSrc } from "@/shared/utils/salonDisplay";
import {
  ISalon,
  ISalonGalleryItem,
} from "@/services/domains/salons/types/salon.type";

function resolveGallery(salon: ISalon): string[] {
  const fromGallery =
    salon.gallery
      ?.map((item) => {
        if (typeof item === "string") return item;
        const g = item as ISalonGalleryItem;
        return g.url || g.imageUrl || "";
      })
      .filter(Boolean) ?? [];

  if (fromGallery.length > 0) return fromGallery;

  const cover = salon.coverImageUrl || salon.imageUrl;
  if (cover) return [cover];
  return [];
}

function BrandedFallback({ name }: { name: string }) {
  const monogram = (name.trim().charAt(0) || "س").toUpperCase();

  return (
    <div
      className="relative flex h-[35vh] w-full items-center justify-center overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[linear-gradient(145deg,#060e02_0%,#0c1707_45%,#13220d_78%,rgba(155,233,85,0.12)_100%)]" />
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(156,173,149,0.55) 1px, transparent 0)",
          backgroundSize: "18px 18px",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
      <span className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border border-border bg-surface/80 text-3xl font-bold text-foreground-muted">
        {monogram}
      </span>
    </div>
  );
}

interface SalonsDetailHeroProps {
  salon: ISalon;
}

export default function SalonsDetailHero({ salon }: SalonsDetailHeroProps) {
  const images = resolveGallery(salon);

  if (images.length === 0) {
    return <BrandedFallback name={salon.name} />;
  }

  return (
    <div className="relative w-full overflow-hidden">
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true }}
        loop={images.length > 1}
        className="h-full w-full home-swiper"
      >
        {images.map((img, i) => {
          const src = salonImageSrc(img, "");
          if (!src) return null;
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
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent" />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
