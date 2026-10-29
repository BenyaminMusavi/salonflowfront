"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import RatingValue from "@/shared/components/composites/rating/RatingValue";
import GenderAudienceBadge from "@/shared/components/composites/gender-audience-badge/GenderAudienceBadge";
import { RouteAddress } from "@/shared/data/routeAddress";
import { cn } from "@/shared/utils/className";
import { formatDistanceKm } from "@/shared/utils/distance";
import { isMapConfigured } from "@/shared/map/mapConfig";
import { useQueryMapPins } from "@/services/domains/salons/hooks/useQueryMapPins";
import type { IGetMapPinsParams, IMapBounds, ISalonMapPin } from "@/services/domains/salons/types/salons.type";
import MapLegend from "./MapLegend";
import { buildMapPinsParams } from "./mapPinsParams";
import type { TMapFailReason } from "./SearchMap";

// MapLibre (+ its CSS) is only downloaded when this view is opened.
const SearchMap = dynamic(() => import("./SearchMap"), {
  ssr: false,
  loading: () => <MapPlaceholder text="در حال آماده‌سازی نقشه…" />,
});

function MapPlaceholder({ text }: { text: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-background-secondary text-sm text-foreground-muted">{text}</div>
  );
}

const FAIL_TEXT: Record<TMapFailReason, string> = {
  "style-error": "نقشه بارگذاری نشد. اینترنت را بررسی کنید.",
  timeout: "نقشه دیر بالا آمد. اینترنت را بررسی کنید.",
  unsupported: "مرورگر شما نقشه را پشتیبانی نمی‌کند.",
};

export interface ISearchMapViewProps {
  /** Same filters as the list (search, type, gender, price, rating). Bounds and GPS are added here. */
  filters: Omit<IGetMapPinsParams, keyof IMapBounds | "lat" | "lng">;
  reference: { lat: number; lng: number } | null;
  /** [lng, lat] of the list's salons, used to frame the first view when there is no GPS point. */
  fitPoints: [number, number][];
  selectedBranchId: string | null;
  onSelectBranch: (pin: ISalonMapPin) => void;
  /** Set when a list card asked «نمایش روی نقشه». */
  focus: { lat: number; lng: number; key: number } | null;
  onBackToList: () => void;
}

export default function SearchMapView({
  filters,
  reference,
  fitPoints,
  selectedBranchId,
  onSelectBranch,
  focus,
  onBackToList,
}: ISearchMapViewProps) {
  const [bounds, setBounds] = useState<IMapBounds | null>(null);
  const [failReason, setFailReason] = useState<TMapFailReason | null>(null);
  // Bumping it remounts the map after a failure («تلاش دوباره»).
  const [mapAttempt, setMapAttempt] = useState(0);

  const params = useMemo(
    () => (bounds ? buildMapPinsParams(bounds, { ...filters, lat: reference?.lat, lng: reference?.lng }) : null),
    [bounds, filters, reference]
  );
  const { data, isFetching, isError, isPlaceholderData, refetch } = useQueryMapPins(params);

  // react-query keeps the previous rows as placeholder while a request is in flight. That is right for a pan (same
  // filters, no flicker) but wrong after a filter / GPS change: pins of the old filter must not stay on the map.
  const filtersKey = useMemo(() => JSON.stringify([filters, reference?.lat, reference?.lng]), [filters, reference]);
  const shownFiltersKey = useRef(filtersKey);
  if (data && !isPlaceholderData) shownFiltersKey.current = filtersKey;
  const outdated = isPlaceholderData && shownFiltersKey.current !== filtersKey;

  const pins = useMemo(() => (outdated ? [] : data?.data?.items ?? []), [data, outdated]);
  const truncated = !outdated && data?.data?.isTruncated === true;
  const showEmpty = !isFetching && !isError && params != null && pins.length === 0;

  const pinsByBranch = useMemo(() => new Map(pins.map((p) => [p.branchPublicId, p])), [pins]);
  const handleSelect = useCallback(
    (branchPublicId: string) => {
      const pin = pinsByBranch.get(branchPublicId);
      if (pin) onSelectBranch(pin);
    },
    [pinsByBranch, onSelectBranch]
  );

  // Keep the chosen card in view in the strip when a pin was tapped.
  const stripRefs = useRef(new Map<string, HTMLElement>());
  useEffect(() => {
    if (selectedBranchId) stripRefs.current.get(selectedBranchId)?.scrollIntoView?.({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [selectedBranchId]);

  if (!isMapConfigured || failReason) {
    return (
      <div className="mx-4 flex flex-col items-center gap-3 rounded-[20px] bg-background-secondary p-6 text-center">
        <p className="text-sm text-foreground-muted">
          {failReason ? FAIL_TEXT[failReason] : "نقشه فعلاً در دسترس نیست."} می‌توانید فهرست سالن‌ها را ببینید.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {failReason && failReason !== "unsupported" ? (
            <button
              type="button"
              onClick={() => {
                setFailReason(null);
                setMapAttempt((n) => n + 1);
              }}
              className="rounded-full bg-background-tertiary px-5 py-2 text-sm font-bold text-foreground"
            >
              تلاش دوباره
            </button>
          ) : null}
          <button type="button" onClick={onBackToList} className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">
            بازگشت به فهرست
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="px-safe-area">
        <div className="relative h-[58vh] min-h-[320px] overflow-hidden rounded-[20px] bg-background-secondary">
          <SearchMap
            key={mapAttempt}
            pins={pins}
            selectedBranchId={selectedBranchId}
            onSelectBranch={handleSelect}
            onBoundsChange={setBounds}
            onFail={setFailReason}
            reference={reference}
            fitPoints={fitPoints}
            focus={focus}
          />

          <div className="pointer-events-none absolute inset-x-2 top-2 flex flex-col items-start gap-1.5">
            {isFetching ? <StatusChip>در حال بارگذاری…</StatusChip> : null}
            {isError ? (
              <button
                type="button"
                onClick={() => void refetch()}
                className="pointer-events-auto rounded-full bg-error px-3 py-1 text-[11px] font-semibold text-white"
              >
                دریافت سالن‌ها ناموفق بود؛ دوباره
              </button>
            ) : null}
            {truncated ? <StatusChip>سالن‌های این محدوده زیاد است؛ برای دیدن همه بزرگ‌نمایی کنید.</StatusChip> : null}
            {showEmpty ? <StatusChip>در این محدوده سالنی نیست؛ نقشه را جابه‌جا یا فیلترها را کم کنید.</StatusChip> : null}
          </div>

          <div className="pointer-events-none absolute inset-x-2 bottom-2">
            <div className="pointer-events-auto w-fit max-w-full">
              <MapLegend />
            </div>
          </div>
        </div>
      </div>

      {pins.length > 0 ? (
        <ul className="flex snap-x gap-3 overflow-x-auto px-safe-area pb-1" aria-label="سالن‌های روی نقشه">
          {pins.map((pin) => {
            const selected = pin.branchPublicId === selectedBranchId;
            return (
              <li
                key={pin.branchPublicId}
                ref={(el) => {
                  if (el) stripRefs.current.set(pin.branchPublicId, el);
                  else stripRefs.current.delete(pin.branchPublicId);
                }}
                className="w-56 shrink-0 snap-center"
              >
                <div
                  className={cn(
                    "flex h-full flex-col gap-1 rounded-[16px] border p-3",
                    selected ? "border-primary bg-primary/10" : "border-border bg-background-secondary"
                  )}
                >
                  <button type="button" onClick={() => onSelectBranch(pin)} aria-pressed={selected} className="flex flex-col items-start gap-1 text-right">
                    <GenderAudienceBadge audience={pin.genderType} className="text-foreground-muted" />
                    <span className="line-clamp-1 text-sm font-bold text-foreground">{pin.name}</span>
                    <span className="line-clamp-1 text-xs text-foreground-muted">{pin.branchName}</span>
                    <span className="flex items-center gap-2 text-[11px] text-foreground-muted">
                      <RatingValue rating={pin.rating} reviewCount={pin.reviewCount} textClassName="text-[11px] font-semibold text-foreground-muted" />
                      {pin.distanceKm != null ? <span>≈ {formatDistanceKm(pin.distanceKm)}</span> : null}
                    </span>
                  </button>
                  <Link href={RouteAddress.SALONS.DETAILS(pin.id)} className="mt-1 text-xs font-bold text-primary">
                    مشاهده و رزرو
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function StatusChip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-surface/90 px-3 py-1 text-[11px] font-semibold text-foreground backdrop-blur-sm">{children}</span>;
}
