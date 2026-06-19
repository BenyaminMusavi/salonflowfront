"use client";

import { ArrowUpLeftIcon, StarIcon } from "@phosphor-icons/react";
import Image from "next/image";
const cards = [
  {
    title: "سالن زیبایی نیلوفر",
    rating: "4.7",
    image: "/images/salons/salon-1.jpeg",
  },
  {
    title: "آرایشگاه ماه‌رخ",
    rating: "4.6",
    image: "/images/salons/salon-2.jpeg",
  },
  {
    title: "سالن مو آوینا",
    rating: "4.5",
    image: "/images/salons/salon-3.jpeg",
  },
  {
    title: "سالن زیبایی یاس",
    rating: "4.8",
    image: "/images/salons/salon-4.jpeg",
  },
  {
    title: "مرکز ناخن الماس",
    rating: "4.4",
    image: "/images/salons/salon-5.jpeg",
  },
  {
    title: "پیرایش مردانه آراد",
    rating: "4.9",
    image: "/images/salons/salon-6.jpeg",
  },
];

export default function SearchCardGrid() {
  return (
    <div className="px-safe-area">
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card, i) => (
          <div key={i} className="relative h-52 overflow-hidden rounded-[20px]">
            <Image
              src={card.image}
              alt={card.title}
              fill
              className="object-cover"
              sizes="(max-width:768px) 50vw, 25vw"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-sm">
              <StarIcon size={12} weight="fill" className="text-yellow-400" />
              <span className="text-[11px] font-semibold text-white">
                {card.rating}
              </span>
            </div>

            <div className="absolute inset-x-4 bottom-4 z-10 flex items-center justify-between">
              <h4 className="text-[14px] font-bold text-white">{card.title}</h4>

              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground backdrop-blur-sm">
                <ArrowUpLeftIcon size={15} weight="bold" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
