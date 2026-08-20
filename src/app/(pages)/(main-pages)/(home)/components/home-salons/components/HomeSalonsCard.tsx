"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeftIcon, StarIcon } from "@phosphor-icons/react";
import FavoriteHeartButton from "@/shared/components/composites/favorite-heart/FavoriteHeartButton";

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

      <div className="absolute inset-0 bg-gradient-to-t from-overlay/75 via-overlay/20 to-transparent" />

      <div className="absolute left-4 top-4">
        <div className="flex h-8 items-center gap-2 rounded-full bg-overlay/40 px-3 backdrop-blur-xl">
          <span className="text-sm font-medium text-on-media">
            {rating.toFixed(1)}
          </span>
          <StarIcon weight="fill" size={18} className="text-primary" />
        </div>
      </div>

      <FavoriteHeartButton
        isFavorite={saved}
        disabled={!canFavorite}
        pending={favoritePending}
        onToggle={onToggleFavorite}
        className="absolute right-4 top-4 z-10 h-10 w-10 bg-overlay/40 backdrop-blur-xl hover:bg-overlay/60"
      />

      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center justify-between rounded-[28px] border border-on-media/10 bg-overlay/35 p-4 backdrop-blur-2xl">
          <div className="min-w-0">
            <h3 className="truncate text-[16px] font-semibold text-on-media">
              {name}
            </h3>
            <p className="mt-1 truncate text-[12px] text-on-media/70">{address}</p>
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
