"use client";

import { useState } from "react";
import Link from "next/link";
import { CrosshairIcon, MapPinIcon } from "@phosphor-icons/react";
import SearchCardGrid from "@/app/(pages)/(main-pages)/search/components/search-card-grid/SearchCardGrid";
import { useQueryApprovedSalons } from "@/services/domains/salons/hooks/useQueryApprovedSalons";
import { useCurrentPosition, useUserLocation } from "@/services/domains/locations/hooks/useUserLocation";
import {
  NEARBY_RADIUS_KM,
  isFarFromSavedCity,
  isLocationFeatureEnabled,
} from "@/services/domains/locations/utils/userLocation";
import LocationChip from "@/shared/components/composites/user-location/LocationChip";
import LocationPickerSheet from "@/shared/components/composites/user-location/LocationPickerSheet";
import { RouteAddress } from "@/shared/data/routeAddress";

const NEARBY_COUNT = 6;

/**
 * «سالن‌های نزدیک من» — its own section, next to (never instead of) the other home sections.
 * Device position (only after the user's tap): nearest salons within 20 km with their distance.
 * Manual city/district: salons of that area. Nothing set: a prompt to set the location.
 */
export default function HomeNearbySalons() {
  if (!isLocationFeatureEnabled) return null;
  return <NearbySection />;
}

function NearbySection() {
  const location = useUserLocation();
  const gps = useCurrentPosition();
  const [pickerOpen, setPickerOpen] = useState(false);

  const isGps = location.mode === "gps";
  const salons = useQueryApprovedSalons(
    { page: 1, pageSize: NEARBY_COUNT, ...location.params, radiusKm: isGps ? NEARBY_RADIUS_KM : undefined },
    location.hasLocation
  );
  const items = salons.data?.data?.items ?? [];
  // «همه» opens the search page with the same location (it reads the same store) and, for GPS, the same radius.
  const allHref = isGps ? `${RouteAddress.SEARCH.BASE}?radiusKm=${NEARBY_RADIUS_KM}` : RouteAddress.SEARCH.BASE;

  const title = isGps
    ? "سالن‌های نزدیک شما"
    : location.manual
      ? `سالن‌های ${location.manual.district?.name ?? location.manual.city.name}`
      : "سالن‌های نزدیک شما";

  return (
    <section className="flex flex-col gap-3" aria-labelledby="home-nearby-title">
      <div className="flex items-center justify-between gap-2 px-safe-area">
        <h2 id="home-nearby-title" className="min-w-0 truncate text-[16px] font-bold text-foreground">
          {title}
        </h2>
        {location.hasLocation && items.length > 0 ? (
          <Link href={allHref} className="shrink-0 text-[13px] font-semibold text-primary">
            همه
          </Link>
        ) : null}
      </div>

      {!location.hasLocation ? (
        <div className="mx-safe-area flex flex-col gap-3 rounded-[20px] bg-surface p-4">
          <p className="text-sm text-foreground">برای دیدن سالن‌های اطراف، موقعیت خود را مشخص کنید.</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => gps.request()}
              disabled={gps.loading}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              <CrosshairIcon size={16} weight="bold" />
              {gps.loading ? "در حال دریافت موقعیت…" : "موقعیت فعلی من"}
            </button>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-background-secondary px-4 py-2 text-sm font-bold text-foreground"
            >
              <MapPinIcon size={16} weight="bold" />
              انتخاب شهر و محله
            </button>
          </div>
          {gps.error ? <p role="alert" className="text-xs text-error">{gps.error}</p> : null}
        </div>
      ) : (
        <>
          <div className="px-safe-area">
            <LocationChip />
          </div>
          {isGps && isFarFromSavedCity(location.gps, location.manual) ? (
            <p className="mx-safe-area rounded-[14px] bg-surface px-3 py-2 text-xs text-foreground-muted">
              به نظر می‌رسد از «{location.manual?.city.name}» دور هستید. شهر ذخیره‌شده‌ی شما تغییر نکرده است؛{" "}
              <button type="button" onClick={() => setPickerOpen(true)} className="font-semibold text-primary">
                انتخاب شهر جدید
              </button>
            </p>
          ) : null}
          {!salons.isLoading && !salons.isError && items.length === 0 ? (
            <div className="mx-safe-area flex flex-col items-start gap-2 rounded-[20px] bg-surface p-4">
              <p className="text-sm text-foreground">
                {isGps ? `تا ${NEARBY_RADIUS_KM} کیلومتری شما هنوز سالنی در صفا نیست.` : "در این محدوده هنوز سالنی در صفا نیست."}
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setPickerOpen(true)} className="rounded-full bg-background-secondary px-4 py-1.5 text-xs font-bold text-foreground">
                  تغییر موقعیت
                </button>
                <Link href={RouteAddress.SEARCH.BASE} className="rounded-full bg-background-secondary px-4 py-1.5 text-xs font-bold text-foreground">
                  همه‌ی سالن‌ها
                </Link>
              </div>
            </div>
          ) : (
            <SearchCardGrid salons={items} isLoading={salons.isLoading} isError={salons.isError} isStale={salons.isPlaceholderData} />
          )}
        </>
      )}

      <LocationPickerSheet open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </section>
  );
}
