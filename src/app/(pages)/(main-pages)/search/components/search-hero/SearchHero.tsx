"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { ArrowUpLeftIcon, StarIcon } from "@phosphor-icons/react";

const slides = [
  {
    subtitle: "سالن تتو",
    title: "مرکز تخصصی تتو لیکو",
    rating: "4.7",
    reviews: "3,109",
    image:
      "/images/salons/salon-3.jpeg",
  },
  {
    subtitle: "سالن زیبایی",
    title: "عروس شرقی",
    rating: "4.8",
    reviews: "1,204",
    image:
      "/images/salons/salon-4.jpeg",
  },
];

export default function SearchHero() {
  return (
    <div className="relative w-full px-safe-area">
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true }}
        loop
        className="home-swiper w-full"
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i}>
            <div className="relative h-[180px] w-full overflow-hidden rounded-[28px]">
              {/* image */}
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

              {/* content */}
              <div className="relative z-10 flex h-full w-3/5 flex-col justify-end gap-2 p-5">
                <span className="text-[11px] text-white/70">
                  {slide.subtitle}
                </span>

                <h3 className="text-[18px] font-bold leading-tight text-white">
                  {slide.title}
                </h3>

                <div className="mt-1 flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-full bg-primary px-5 py-2 text-[12px] font-bold text-primary-foreground"
                  >
                    رزرو کن
                  </button>

                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
                  >
                    <ArrowUpLeftIcon size={16} weight="bold" />
                  </button>
                </div>
              </div>

              {/* rating */}
              <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
                <StarIcon size={14} className="text-yellow-400" weight="fill" />
                <span className="text-[12px] font-semibold text-white">
                  {slide.rating} ({slide.reviews})
                </span>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}