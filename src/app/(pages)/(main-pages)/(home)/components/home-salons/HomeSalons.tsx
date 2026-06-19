"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import HomeSalonsCard from "@/app/(pages)/(main-pages)/(home)/components/home-salons/components/HomeSalonsCard";
import barbershop from "@/shared/assets/images/barbershop.png";

function HomeSalons() {
  const salons = [
    { name: "خاکستری", address: "تهران - فلاح", rating: 4.5, saved: false },
    { name: "خاکستری", address: "تهران - فلاح", rating: 4.5, saved: false },
    { name: "خاکستری", address: "تهران - فلاح", rating: 4.5, saved: false },
    { name: "خاکستری", address: "تهران - فلاح", rating: 4.5, saved: false },
    { name: "خاکستری", address: "تهران - فلاح", rating: 4.5, saved: false },
  ];

  return (
    <div className={"flex flex-col gap-y-3 px-safe-area"}>
      <span className={"text-[24px] font-bold text-white"}>
        بهترین آرایشگرتو پیدا کن
      </span>
      <div className="">
        <Swiper
          modules={[Pagination]}
          slidesPerView={1}
          spaceBetween={12}
          pagination={{ clickable: true }}
          className="home-swiper"
        >
          {salons.map((salon, index) => (
            <SwiperSlide key={index}>
              <HomeSalonsCard
                name={salon.name}
                address={salon.address}
                image={barbershop.src}
                rating={salon.rating}
                saved={salon.saved}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export default HomeSalons;
