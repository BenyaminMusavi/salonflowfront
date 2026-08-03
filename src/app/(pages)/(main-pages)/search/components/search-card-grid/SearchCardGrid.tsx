"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpLeftIcon, StarIcon } from "@phosphor-icons/react";
import { ISalonCard } from "@/services/domains/salons/types/salons.type";
import { RouteAddress } from "@/shared/data/routeAddress";
import { salonImageSrc } from "@/shared/utils/salonDisplay";
import barbershop from "@/shared/assets/images/barbershop.png";

interface SearchCardGridProps {
  salons: ISalonCard[];
  isLoading?: boolean;
  isError?: boolean;
}

export default function SearchCardGrid({
  salons,
  isLoading,
  isError,
}: SearchCardGridProps) {
  if (isLoading) {
    return (
      <p className="px-safe-area text-[13px] text-foreground-muted">
        در حال بارگذاری سالن‌ها…
      </p>
    );
  }

  if (isError) {
    return (
      <p className="px-safe-area text-[13px] text-error">
        خطا در دریافت لیست سالن‌ها
      </p>
    );
  }

  if (salons.length === 0) {
    return (
      <p className="px-safe-area text-[13px] text-foreground-muted">
        سالنی با این فیلترها یافت نشد
      </p>
    );
  }

  return (
    <div className="px-safe-area">
      <div className="grid grid-cols-2 gap-3">
        {salons.map((salon) => {
          const image = salonImageSrc(salon.imageUrl, barbershop.src);
          return (
            <Link
              key={salon.id}
              href={RouteAddress.SALONS.DETAILS(salon.id)}
              className="relative h-52 overflow-hidden rounded-[20px]"
            >
              <Image
                src={image}
                alt={salon.name}
                fill
                unoptimized={/^https?:\/\//i.test(image)}
                className="object-cover"
                sizes="(max-width:768px) 50vw, 25vw"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-sm">
                <StarIcon size={12} weight="fill" className="text-yellow-400" />
                <span className="text-[11px] font-semibold text-white">
                  {(salon.rating ?? 0).toFixed(1)}
                </span>
              </div>

              <div className="absolute inset-x-4 bottom-4 z-10 flex items-center justify-between gap-2">
                <h4 className="truncate text-[14px] font-bold text-white">
                  {salon.name}
                </h4>

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground backdrop-blur-sm">
                  <ArrowUpLeftIcon size={15} weight="bold" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
