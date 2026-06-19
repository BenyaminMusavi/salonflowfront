"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import barbershop from "@/shared/assets/images/barbershop.png";

const images = [barbershop, barbershop, barbershop];

export default function SalonsDetailHero() {
  return (
    <div className="relative w-full overflow-hidden ">
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true }}
        loop
        className="h-full w-full home-swiper"
      >
        {images.map((img, i) => (
          <SwiperSlide key={i}>
            <div className="relative h-[35vh] w-full">
              <Image
                src={img}
                alt={`salon-${i}`}
                fill
                className="object-cover"
                priority={i === 0}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
