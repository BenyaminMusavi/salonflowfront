"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpLeftIcon,
  BookmarkSimpleIcon,
  StarIcon,
} from "@phosphor-icons/react";

interface HomeSalonsCardProps {
  href: string;
  image: string;
  name: string;
  address: string;
  rating: number;
  saved?: boolean;
  canFavorite?: boolean;
  onToggleFavorite?: () => void;
  favoritePending?: boolean;
}

export default function HomeSalonsCard({
  href,
  image,
  name,
  address,
  rating,
  saved = false,
  canFavorite = false,
  onToggleFavorite,
  favoritePending = false,
}: HomeSalonsCardProps) {
  return (
    <article className="group relative h-[280px] w-full overflow-hidden rounded-[32px] bg-surface shadow-2xl">
      <Image
        src={image}
        alt={name}
        fill
        unoptimized={/^https?:\/\//i.test(image)}
        className="object-cover transition duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

      <div className="absolute left-4 top-4">
        <div className="flex h-8 items-center gap-2 rounded-full bg-black/40 px-3 backdrop-blur-xl">
          <span className="text-sm font-medium text-white">
            {rating.toFixed(1)}
          </span>
          <StarIcon weight="fill" size={18} className="text-primary" />
        </div>
      </div>

      <button
        type="button"
        disabled={!canFavorite || favoritePending}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleFavorite?.();
        }}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-xl transition hover:bg-black/60 disabled:opacity-40"
      >
        <BookmarkSimpleIcon
          weight={saved ? "fill" : "regular"}
          size={22}
          className="text-white"
        />
      </button>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center justify-between rounded-[28px] border border-white/10 bg-black/35 p-4 backdrop-blur-2xl">
          <div className="min-w-0">
            <h3 className="truncate text-[16px] font-semibold text-white">
              {name}
            </h3>
            <p className="mt-1 truncate text-[12px] text-white/70">{address}</p>
          </div>

          <Link
            href={href}
            className="ms-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition duration-200 hover:scale-105 hover:bg-primary-hover active:scale-95"
          >
            <ArrowUpLeftIcon weight="bold" size={24} />
          </Link>
        </div>
      </div>
    </article>
  );
}
