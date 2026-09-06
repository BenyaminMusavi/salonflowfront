"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchHeader from "./components/search-header/SearchHeader";
import SearchHero from "./components/search-hero/SearchHero";
import SearchCategories from "./components/search-categories/SearchCategories";
import SearchSegmentedToggle from "./components/search-segmented-toggle/SearchSegmentedToggle";
import SearchCardGrid from "./components/search-card-grid/SearchCardGrid";
import SearchFilterSheet, {
  ISearchFilters,
} from "./components/search-filter-sheet/SearchFilterSheet";
import { useQueryApprovedSalons } from "@/services/domains/salons/hooks/useQueryApprovedSalons";
import { useQueryServiceTypes } from "@/services/domains/service-type/hooks/useQueryServiceTypes";
import { RouteAddress } from "@/shared/data/routeAddress";
import { GenderType } from "@/services/common/enums/domain-enums";

export default function SearchView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";
  const urlServiceTypePublicId = searchParams.get("serviceTypePublicId");
  const urlMinPrice = searchParams.get("minPrice") ?? "";
  const urlMaxPrice = searchParams.get("maxPrice") ?? "";
  const urlMinRating = searchParams.get("minRating");
  const urlGenderType = searchParams.get("genderType");

  const filters: ISearchFilters = useMemo(
    () => ({
      minPrice: urlMinPrice,
      maxPrice: urlMaxPrice,
      minRating: urlMinRating ? Number(urlMinRating) : null,
      genderType: urlGenderType ? (Number(urlGenderType) as GenderType) : null,
    }),
    [urlMinPrice, urlMaxPrice, urlMinRating, urlGenderType]
  );

  const hasActiveFilters =
    filters.minPrice !== "" ||
    filters.maxPrice !== "" ||
    filters.minRating != null ||
    filters.genderType != null;

  const [activeTab, setActiveTab] = useState<"new" | "recommended">("new");
  const [draftSearch, setDraftSearch] = useState(urlSearch);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Geolocation is never put in the URL (it's location data) — kept in memory only.
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    setDraftSearch(urlSearch);
  }, [urlSearch]);

  const syncUrl = useCallback(
    (next: {
      search?: string;
      serviceTypePublicId?: string | null;
      filters?: ISearchFilters;
    }) => {
      const params = new URLSearchParams(searchParams.toString());
      const search =
        next.search !== undefined ? next.search.trim() : urlSearch.trim();
      if (search) params.set("search", search);
      else params.delete("search");

      const serviceTypePublicId =
        next.serviceTypePublicId !== undefined
          ? next.serviceTypePublicId
          : urlServiceTypePublicId;
      if (serviceTypePublicId != null && serviceTypePublicId !== "") {
        params.set("serviceTypePublicId", serviceTypePublicId);
      } else {
        params.delete("serviceTypePublicId");
      }

      const nextFilters = next.filters ?? filters;
      if (nextFilters.minPrice) params.set("minPrice", nextFilters.minPrice);
      else params.delete("minPrice");
      if (nextFilters.maxPrice) params.set("maxPrice", nextFilters.maxPrice);
      else params.delete("maxPrice");
      if (nextFilters.minRating != null)
        params.set("minRating", String(nextFilters.minRating));
      else params.delete("minRating");
      if (nextFilters.genderType != null)
        params.set("genderType", String(nextFilters.genderType));
      else params.delete("genderType");

      const qs = params.toString();
      router.replace(
        qs ? `${RouteAddress.SEARCH.BASE}?${qs}` : RouteAddress.SEARCH.BASE
      );
    },
    [router, searchParams, urlSearch, urlServiceTypePublicId, filters]
  );

  const handleToggleMyLocation = (next: boolean) => {
    if (!next) {
      setCoords(null);
      setLocationError(null);
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError("مرورگر شما از موقعیت مکانی پشتیبانی نمی‌کند.");
      return;
    }
    setLocationLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLoading(false);
      },
      () => {
        setLocationError("دسترسی به موقعیت مکانی رد شد یا در دسترس نیست.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const { data: salonsRes, isLoading, isError } = useQueryApprovedSalons({
    page: 1,
    pageSize: 20,
    search: urlSearch || undefined,
    serviceTypePublicId: urlServiceTypePublicId || undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    minRating: filters.minRating ?? undefined,
    genderType: filters.genderType ?? undefined,
    lat: coords?.lat,
    lng: coords?.lng,
  });

  const { data: serviceTypesRes, isLoading: typesLoading } =
    useQueryServiceTypes();

  const salons = salonsRes?.data?.items ?? [];
  const categories = serviceTypesRes?.data ?? [];

  return (
    <div className="flex flex-col gap-5 pt-20 pb-32">
      <SearchHeader
        value={draftSearch}
        onChange={setDraftSearch}
        onSubmit={() => syncUrl({ search: draftSearch })}
        onOpenFilters={() => setFiltersOpen(true)}
        hasActiveFilters={hasActiveFilters}
      />
      <SearchHero salons={salons} />
      <SearchCategories
        categories={categories}
        selectedId={urlServiceTypePublicId}
        isLoading={typesLoading}
        onSelect={(id) =>
          syncUrl({ serviceTypePublicId: id != null ? String(id) : null })
        }
      />
      <SearchSegmentedToggle activeTab={activeTab} onTabChange={setActiveTab} />
      <SearchCardGrid
        salons={salons}
        isLoading={isLoading}
        isError={isError}
      />

      <SearchFilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onApply={(next) => syncUrl({ filters: next })}
        useMyLocation={coords != null}
        onToggleMyLocation={handleToggleMyLocation}
        locationError={locationError}
        locationLoading={locationLoading}
      />
    </div>
  );
}
