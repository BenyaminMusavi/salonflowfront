"use client";

import { useState } from "react";
import Link from "next/link";
import { CaretLeftIcon, MapPinIcon, NavigationArrowIcon } from "@phosphor-icons/react";
import SearchCardGrid from "@/app/(pages)/(main-pages)/search/components/search-card-grid/SearchCardGrid";
import { useQueryApprovedSalons } from "@/services/domains/salons/hooks/useQueryApprovedSalons";
import { useUserLocation } from "@/services/domains/locations/hooks/useUserLocation";
import {
  NEARBY_RADIUS_KM,
  isFarFromSavedCity,
  isLocationFeatureEnabled,
} from "@/services/domains/locations/utils/userLocation";
import LocationPickerSheet from "@/shared/components/composites/user-location/LocationPickerSheet";
import { RouteAddress } from "@/shared/data/routeAddress";

const NEARBY_COUNT = 6;

/**
 * «سالن‌های نزدیک شما» — its own section, next to (never instead of) the other home sections, which keep showing
 * salons whether or not a location is set. One compact row picks the location: it opens `LocationPickerSheet`, where
 * the device position (on the user's tap) and the manual city/district both live. Device position: nearest salons
 * within 20 km with their distance; manual city/district: that area's salons.
 */
export default function HomeNearbySalons() {
  if (!isLocationFeatureEnabled) return null;
  return <NearbySection />;
}

function NearbySection() {
  const location = useUserLocation();
  const [pickerOpen, setPickerOpen] = useState(false);

  const isGps = location.mode === "gps";
  const salons = useQueryApprovedSalons(
    { page: 1, pageSize: NEARBY_COUNT, ...location.params, radiusKm: isGps ? NEARBY_RADIUS_KM : undefined },
    location.hasLocation
  );
  const items = salons.data?.data?.items ?? [];
  // «همه» opens the search page with the same location (it reads the same store) and, for GPS, the same radius.
  const allHref = isGps ? `${RouteAddress.SEARCH.BASE}?radiusKm=${NEARBY_RADIUS_KM}` : RouteAddress.SEARCH.BASE;
  const LocationIcon = isGps ? NavigationArrowIcon : MapPinIcon;
  const empty = location.hasLocation && !salons.isLoading && !salons.isError && items.length === 0;

  return (
    <section className="flex flex-col gap-3" aria-labelledby="home-nearby-title">
      <div className="flex items-center justify-between gap-2 px-safe-area">
        <h2 id="home-nearby-title" className="min-w-0 truncate text-[16px] font-bold text-foreground">
          سالن‌های نزدیک شما
        </h2>
        {location.hasLocation && items.length > 0 ? (
          <Link href={allHref} className="shrink-0 text-[13px] font-semibold text-primary">
            همه
          </Link>
        ) : null}
      </div>

      <div className="px-safe-area">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          aria-label={location.label ? `موقعیت: ${location.label}. تغییر موقعیت` : "موقعیتت رو انتخاب کن"}
          className="flex w-full items-center gap-2 rounded-[14px] bg-surface px-3 py-2.5 text-right"
        >
          <LocationIcon size={18} weight="fill" className="shrink-0 text-primary" />
          <span className={location.label ? "min-w-0 flex-1 truncate text-sm font-semibold text-foreground" : "min-w-0 flex-1 truncate text-sm text-foreground-muted"}>
            {location.label ?? "موقعیتت رو انتخاب کن"}
          </span>
          <CaretLeftIcon size={16} className="shrink-0 text-foreground-muted" />
        </button>
        {isGps && isFarFromSavedCity(location.gps, location.manual) ? (
          // Only a suggestion: the saved city is never replaced by the device position.
          <p className="mt-1.5 truncate px-1 text-xs text-foreground-muted">
            دور از «{location.manual?.city.name}» هستید؟{" "}
            <button type="button" onClick={() => setPickerOpen(true)} className="font-semibold text-primary">
              تغییر شهر
            </button>
          </p>
        ) : null}
      </div>

      {location.hasLocation ? (
        empty ? (
          <p className="px-safe-area text-[13px] text-foreground-muted">
            {isGps ? `تا ${NEARBY_RADIUS_KM} کیلومتری شما هنوز سالنی در صفا نیست.` : "در این محدوده هنوز سالنی در صفا نیست."}
          </p>
        ) : (
          <SearchCardGrid salons={items} isLoading={salons.isLoading} isError={salons.isError} isStale={salons.isPlaceholderData} />
        )
      ) : null}

      <LocationPickerSheet open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </section>
  );
}
