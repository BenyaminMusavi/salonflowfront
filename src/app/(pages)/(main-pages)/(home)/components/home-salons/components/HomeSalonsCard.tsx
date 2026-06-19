"use client";

import Image from "next/image";
import {
  ArrowUpLeftIcon,
  ArrowUpRightIcon,
  BookmarkSimpleIcon,
  StarIcon,
} from "@phosphor-icons/react";

interface HomeSalonsCardProps {
  image: string;
  name: string;
  address: string;
  rating: number;
  saved?: boolean;
}

export default function HomeSalonsCard({
  image,
  name,
  address,
  rating,
  saved = false,
}: HomeSalonsCardProps) {
  return (
    <article className="group relative h-[280px] w-full overflow-hidden rounded-[32px] bg-surface shadow-2xl">
      {/* Background */}
      <Image
        src={image}
        alt={name}
        fill
        className="object-cover transition duration-500 group-hover:scale-105"
      />

      {/* Dark Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

      {/* Rating */}
      <div className="absolute left-4 top-4">
        <div className="flex h-8 items-center gap-2 rounded-full bg-black/40 px-3 backdrop-blur-xl">
          <span className="text-sm font-medium text-white">
            {rating.toFixed(1)}
          </span>
          <StarIcon weight="fill" size={18} className="text-primary" />
        </div>
      </div>

      {/* Bookmark */}
      <button className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-xl transition hover:bg-black/60">
        <BookmarkSimpleIcon
          weight={saved ? "fill" : "regular"}
          size={22}
          className="text-white"
        />
      </button>

      {/* Bottom Card */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center justify-between rounded-[28px] border border-white/10 bg-black/35 p-4 backdrop-blur-2xl">
          <div className="min-w-0">
            <h3 className="truncate text-[16px] font-semibold text-white">
              {name}
            </h3>

            <p className="mt-1 truncate text-[12px] text-white/70">{address}</p>
          </div>

          <button className="ms-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition duration-200 hover:scale-105 hover:bg-primary-hover active:scale-95">
            <ArrowUpLeftIcon weight="bold" size={24} />
          </button>
        </div>
      </div>
    </article>
  );
}
