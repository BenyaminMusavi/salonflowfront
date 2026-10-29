"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import SearchHeader from "./components/search-header/SearchHeader";
import SearchHero from "./components/search-hero/SearchHero";
import SearchCategories from "./components/search-categories/SearchCategories";
import SearchSortControl, { type TSearchSort } from "./components/search-sort-control/SearchSortControl";
import SearchCardGrid from "./components/search-card-grid/SearchCardGrid";
import SearchFilterSheet, {
  ISearchFilters,
} from "./components/search-filter-sheet/SearchFilterSheet";
import { useInfiniteApprovedSalons } from "@/services/domains/salons/hooks/useInfiniteApprovedSalons";
import { useQueryServiceTypes } from "@/services/domains/service-type/hooks/useQueryServiceTypes";
import { RouteAddress } from "@/shared/data/routeAddress";
import { GenderType } from "@/services/common/enums/domain-enums";
import { isMapConfigured } from "@/shared/map/mapConfig";
import MapErrorBoundary from "@/shared/map/MapErrorBoundary";
import SearchViewToggle, { type TSearchView } from "./components/search-view-toggle/SearchViewToggle";
import type { ISalonCard, ISalonMapPin } from "@/services/domains/salons/types/salons.type";

// The whole map chunk (view + MapLibre + CSS) loads only when the «نقشه» view is shown.
const SearchMapView = dynamic(() => import("./components/search-map/SearchMapView"), { ssr: false });

export default function SearchView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";
  const urlServiceTypePublicId = searchParams.get("serviceTypePublicId");
  const urlMinPrice = searchParams.get("minPrice") ?? "";
  const urlMaxPrice = searchParams.get("maxPrice") ?? "";
  const urlMinRating = searchParams.get("minRating");
  const urlGenderType = searchParams.get("genderType");
  const urlRadiusKm = searchParams.get("radiusKm");
  // `sort=newest` is a real API sort and lives in the URL, so it survives category / filter / list-map changes.
  const sort: TSearchSort = searchParams.get("sort") === "newest" ? "newest" : "recommended";
  // `view=map` survives refresh/share; the toggle is hidden (and the param ignored) while no basemap is configured.
  const view: TSearchView = isMapConfigured && searchParams.get("view") === "map" ? "map" : "list";

  const filters: ISearchFilters = useMemo(
    () => ({
      minPrice: urlMinPrice,
      maxPrice: urlMaxPrice,
      minRating: urlMinRating ? Number(urlMinRating) : null,
      genderType: urlGenderType ? (Number(urlGenderType) as GenderType) : null,
      radiusKm: urlRadiusKm ? Number(urlRadiusKm) : null,
    }),
    [urlMinPrice, urlMaxPrice, urlMinRating, urlGenderType, urlRadiusKm]
  );

  const hasActiveFilters =
    filters.minPrice !== "" ||
    filters.maxPrice !== "" ||
    filters.minRating != null ||
    filters.genderType != null ||
    filters.radiusKm != null;

  const [draftSearch, setDraftSearch] = useState(urlSearch);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Geolocation is never put in the URL (it's location data) — kept in memory only.
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Branch selected on the map / from a card, and the "fly here" request that goes with it.
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [focus, setFocus] = useState<{ lat: number; lng: number; key: number } | null>(null);

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
      if (nextFilters.radiusKm != null)
        params.set("radiusKm", String(nextFilters.radiusKm));
      else params.delete("radiusKm");

      const qs = params.toString();
      router.replace(
        qs ? `${RouteAddress.SEARCH.BASE}?${qs}` : RouteAddress.SEARCH.BASE
      );
    },
    [router, searchParams, urlSearch, urlServiceTypePublicId, filters]
  );

  const setView = (next: TSearchView) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "map") params.set("view", "map");
    else params.delete("view");
    const qs = params.toString();
    router.replace(qs ? `${RouteAddress.SEARCH.BASE}?${qs}` : RouteAddress.SEARCH.BASE);
  };

  const setSort = (next: TSearchSort) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "newest") params.set("sort", "newest");
    else params.delete("sort");
    const qs = params.toString();
    router.replace(qs ? `${RouteAddress.SEARCH.BASE}?${qs}` : RouteAddress.SEARCH.BASE);
  };

  const selectOnMap = (branchPublicId: string, lat: number, lng: number) => {
    setSelectedBranchId(branchPublicId);
    setFocus({ lat, lng, key: Date.now() });
  };

  const handleShowOnMap = (salon: ISalonCard) => {
    if (!salon.branchPublicId || salon.latitude == null || salon.longitude == null) return;
    selectOnMap(salon.branchPublicId, salon.latitude, salon.longitude);
    setView("map");
  };

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

  const {
    data: salonsPages,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isPlaceholderData,
  } = useInfiniteApprovedSalons({
    pageSize: 20,
    search: urlSearch || undefined,
    serviceTypePublicId: urlServiceTypePublicId || undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    minRating: filters.minRating ?? undefined,
    genderType: filters.genderType ?? undefined,
    lat: coords?.lat,
    lng: coords?.lng,
    // A radius only makes sense around a reference point; the backend rejects it without lat/lng.
    radiusKm: coords && filters.radiusKm != null ? filters.radiusKm : undefined,
    sort: sort === "newest" ? "newest" : undefined,
  });

  const { data: serviceTypesRes, isLoading: typesLoading } =
    useQueryServiceTypes();

  const salons = useMemo(
    () => salonsPages?.pages.flatMap((p) => p.data?.items ?? []) ?? [],
    [salonsPages]
  );
  const categories = serviceTypesRes?.data ?? [];

  // Same filters as the list (no radius: the visible box is the area). Bounds and GPS are added by the map view.
  const mapFilters = useMemo(
    () => ({
      search: urlSearch || undefined,
      serviceTypePublicId: urlServiceTypePublicId || undefined,
      genderType: filters.genderType ?? undefined,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      minRating: filters.minRating ?? undefined,
    }),
    [urlSearch, urlServiceTypePublicId, filters]
  );
  const fitPoints = useMemo(
    () =>
      salons
        .filter((s) => s.latitude != null && s.longitude != null)
        .map((s): [number, number] => [s.longitude as number, s.latitude as number]),
    [salons]
  );
  const handleSelectPin = (pin: ISalonMapPin) => selectOnMap(pin.branchPublicId, pin.latitude, pin.longitude);

  return (
    <div className="flex flex-col gap-5 pt-20 pb-32">
      <SearchHeader
        value={draftSearch}
        onChange={setDraftSearch}
        onSubmit={() => syncUrl({ search: draftSearch })}
        onOpenFilters={() => setFiltersOpen(true)}
        hasActiveFilters={hasActiveFilters}
      />
      {view === "list" ? <SearchHero salons={salons} /> : null}
      <SearchCategories
        categories={categories}
        selectedId={urlServiceTypePublicId}
        isLoading={typesLoading}
        onSelect={(id) =>
          syncUrl({ serviceTypePublicId: id != null ? String(id) : null })
        }
      />
      {/* One row, one meaning each: how to show (فهرست / نقشه) and, for the list, in which order. */}
      <div className="flex items-center gap-2 px-safe-area">
        {isMapConfigured ? <SearchViewToggle value={view} onChange={setView} className={view === "map" ? "flex-1" : "shrink-0"} /> : null}
        {view === "list" ? <SearchSortControl value={sort} onChange={setSort} className="min-w-0 flex-1" /> : null}
      </div>
      {view === "map" ? (
        // A map chunk that cannot load/parse (offline, iOS < 16.4) stays a local fallback; the list keeps working.
        <MapErrorBoundary
          fallback={
            <div className="mx-4 flex flex-col items-center gap-3 rounded-[20px] bg-background-secondary p-6 text-center">
              <p className="text-sm text-foreground-muted">نقشه در این دستگاه بارگذاری نشد. می‌توانید فهرست سالن‌ها را ببینید.</p>
              <button type="button" onClick={() => setView("list")} className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">
                بازگشت به فهرست
              </button>
            </div>
          }
        >
          <SearchMapView
            filters={mapFilters}
            reference={coords}
            fitPoints={fitPoints}
            selectedBranchId={selectedBranchId}
            onSelectBranch={handleSelectPin}
            focus={focus}
            onBackToList={() => setView("list")}
          />
        </MapErrorBoundary>
      ) : (
        <>
          <SearchCardGrid
            salons={salons}
            isLoading={isLoading}
            isError={isError}
            hasMore={!!hasNextPage}
            isLoadingMore={isFetchingNextPage}
            onLoadMore={() => fetchNextPage()}
            withinRadius={coords != null && filters.radiusKm != null}
            isStale={isPlaceholderData}
            onShowOnMap={isMapConfigured ? handleShowOnMap : undefined}
          />
        </>
      )}

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
