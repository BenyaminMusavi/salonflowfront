"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowUpLeftIcon, MapPinIcon, StarIcon } from "@phosphor-icons/react";
import { useQueryFavorites } from "@/services/domains/favorites/hooks/useQueryFavorites";
import { useToggleFavorite } from "@/services/domains/favorites/hooks/useToggleFavorite";
import { IFavoriteSalon } from "@/services/domains/favorites/types/favorites.type";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useMutateSwitchContext } from "@/services/domains/auth/hooks/useMutateSwitchContext";
import { RouteAddress } from "@/shared/data/routeAddress";
import { getLoginHref } from "@/shared/utils/authRedirect";
import { salonImageSrc } from "@/shared/utils/salonDisplay";
import barbershop from "@/shared/assets/images/barbershop.png";
import FavoriteHeartButton from "@/shared/components/composites/favorite-heart/FavoriteHeartButton";

function FavoriteSalonCard({ salon }: { salon: IFavoriteSalon }) {
  const { isFavorite, canToggle, isPending, toggle } = useToggleFavorite(
    salon.salonPublicId
  );
  const image = salonImageSrc(salon.imageUrl, barbershop.src);

  return (
    <Link
      href={RouteAddress.SALONS.DETAILS(salon.salonPublicId)}
      className="relative block overflow-hidden rounded-[20px] bg-surface"
    >
      <div className="relative h-44">
        <Image
          src={image}
          alt={salon.salonName}
          fill
          unoptimized={/^https?:\/\//i.test(image)}
          className="object-cover"
          sizes="(max-width:768px) 100vw, 600px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

        <FavoriteHeartButton
          isFavorite={isFavorite}
          disabled={!canToggle}
          pending={isPending}
          onToggle={toggle}
          size={18}
          className="absolute right-3 top-3 z-10 h-9 w-9 bg-black/50 backdrop-blur-sm"
        />

        <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-sm">
          <StarIcon size={12} weight="fill" className="text-yellow-400" />
          <span className="text-[11px] font-semibold text-white">
            {(salon.averageRating ?? 0).toFixed(1)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-bold text-foreground">
            {salon.salonName}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-[12px] text-foreground-muted">
            <MapPinIcon size={14} />
            <span className="truncate">{salon.city || "—"}</span>
          </p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <ArrowUpLeftIcon size={16} weight="bold" />
        </span>
      </div>
    </Link>
  );
}

export default function FavoritesView() {
  const router = useRouter();
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const activeSalonId = useSalonContextStore((s) => s.salonId);
  const { mutate: switchToCustomer, isPending: isSwitchingContext } =
    useMutateSwitchContext();
  const { data, isLoading, isError, refetch, isFetching } =
    useQueryFavorites();

  const salons = data?.data ?? [];
  const waitingForCustomerContext =
    activeSalonId != null || isSwitchingContext;

  useEffect(() => {
    if (!isLoggedIn || activeSalonId == null) return;
    switchToCustomer({ salonId: null, branchId: null });
  }, [isLoggedIn, activeSalonId, switchToCustomer]);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center gap-4 px-safe-area pb-32 pt-10 text-center">
        <h1 className="text-lg font-bold text-foreground">علاقه‌مندی‌های من</h1>
        <p className="text-sm text-foreground-muted">
          برای مشاهده سالن‌های ذخیره‌شده وارد حساب کاربری شوید.
        </p>
        <button
          type="button"
          onClick={() => {
            router.push(getLoginHref(RouteAddress.FAVORITES.BASE));
          }}
          className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          ورود
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-safe-area pb-32 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">علاقه‌مندی‌های من</h1>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-xs text-primary disabled:opacity-40"
        >
          بروزرسانی
        </button>
      </div>

      {(isLoading || waitingForCustomerContext) && (
        <p className="text-sm text-foreground-muted">در حال بارگذاری…</p>
      )}

      {!waitingForCustomerContext && isError && (
        <p className="text-sm text-error">خطا در دریافت علاقه‌مندی‌ها</p>
      )}

      {!isLoading &&
        !waitingForCustomerContext &&
        !isError &&
        salons.length === 0 && (
        <div className="rounded-[20px] bg-surface p-6 text-center">
          <p className="text-sm text-foreground-muted">
            هنوز سالنی ذخیره نکرده‌اید.
          </p>
          <Link
            href={RouteAddress.SEARCH.BASE}
            className="mt-4 inline-flex text-sm font-bold text-primary"
          >
            جستجوی سالن
          </Link>
        </div>
      )}

      {!waitingForCustomerContext && (
        <div className="flex flex-col gap-3">
          {salons.map((salon) => (
            <FavoriteSalonCard key={salon.salonPublicId} salon={salon} />
          ))}
        </div>
      )}
    </div>
  );
}
