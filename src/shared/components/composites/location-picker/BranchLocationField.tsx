"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { CrosshairIcon, MapPinIcon, TrashIcon } from "@phosphor-icons/react";
import { Input } from "@/shared/components/primitives/input/Input";
import { isMapConfigured } from "@/shared/map/mapConfig";
import MapErrorBoundary from "@/shared/map/MapErrorBoundary";
import { cn } from "@/shared/utils/className";
import { coordinatesPairError, parseCoordinateInput, roundCoordinate } from "@/shared/utils/coordinates";

// MapLibre is downloaded only after the owner opens the map.
const LocationPickerMap = dynamic(() => import("./LocationPickerMap"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-xs text-foreground-muted">در حال آماده‌سازی نقشه…</div>,
});

const GPS_ERRORS: Record<number, string> = {
  1: "دسترسی به موقعیت داده نشد. می‌توانید روی نقشه بزنید یا مختصات را دستی وارد کنید.",
  2: "موقعیت دستگاه در دسترس نیست. روی نقشه بزنید یا مختصات را دستی وارد کنید.",
  3: "دریافت موقعیت طول کشید. دوباره امتحان کنید یا روی نقشه بزنید.",
};

export interface IBranchLocationFieldProps {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  /** Both numbers, or `null, null` when the owner clears the location. */
  onChange: (latitude: number | null, longitude: number | null) => void;
  /** Shown under the field; also set by the parent for save-time validation. */
  error?: string | null;
  className?: string;
}

const buttonClass =
  "inline-flex items-center gap-1.5 rounded-full bg-background-secondary px-3 py-1.5 text-xs font-semibold text-foreground disabled:opacity-60";

/**
 * Where a branch is. The owner can tap/drag on a map, use their current position (only when they press the
 * button), clear it, or type the numbers by hand. Nothing here is required: no GPS permission, a map that fails
 * to load, or leaving it empty never blocks saving the branch.
 */
export default function BranchLocationField({ latitude, longitude, onChange, error, className }: IBranchLocationFieldProps) {
  const [mapOpen, setMapOpen] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const [manualOpen, setManualOpen] = useState(!isMapConfigured);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [recenterKey, setRecenterKey] = useState(0);

  const hasValue = latitude != null && longitude != null && Number.isFinite(latitude) && Number.isFinite(longitude);
  const [latText, setLatText] = useState(latitude == null ? "" : String(latitude));
  const [lngText, setLngText] = useState(longitude == null ? "" : String(longitude));

  // Pick/GPS/clear change the numbers from outside the text boxes.
  useEffect(() => {
    // Object.is: an unparsable text ("-", "abc") reaches the parent as NaN, and NaN !== NaN would rewrite the box to "NaN".
    if (!Object.is(parseCoordinateInput(latText), latitude ?? null)) setLatText(latitude == null ? "" : String(latitude));
    if (!Object.is(parseCoordinateInput(lngText), longitude ?? null)) setLngText(longitude == null ? "" : String(longitude));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the incoming props
  }, [latitude, longitude]);

  const mapAvailable = isMapConfigured && !mapFailed;
  const pairError = error ?? coordinatesPairError(latitude, longitude);

  const useMyPosition = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsError(GPS_ERRORS[2]);
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(roundCoordinate(pos.coords.latitude), roundCoordinate(pos.coords.longitude));
        setRecenterKey((k) => k + 1);
        setGpsLoading(false);
      },
      (err) => {
        setGpsError(GPS_ERRORS[err.code] ?? GPS_ERRORS[2]);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 }
    );
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2 text-sm">
        <MapPinIcon size={16} className={hasValue ? "text-primary" : "text-foreground-muted"} />
        <span className={hasValue ? "text-foreground" : "text-foreground-muted"} dir="ltr">
          {hasValue ? `${latitude}, ${longitude}` : "موقعیت روی نقشه ثبت نشده (اختیاری)"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {mapAvailable ? (
          <button type="button" className={buttonClass} onClick={() => setMapOpen((v) => !v)} aria-expanded={mapOpen}>
            <MapPinIcon size={14} />
            {mapOpen ? "بستن نقشه" : hasValue ? "تغییر موقعیت روی نقشه" : "انتخاب روی نقشه"}
          </button>
        ) : null}
        <button type="button" className={buttonClass} onClick={useMyPosition} disabled={gpsLoading}>
          <CrosshairIcon size={14} />
          {gpsLoading ? "در حال دریافت…" : "موقعیت فعلی من"}
        </button>
        {hasValue ? (
          <button type="button" className={cn(buttonClass, "text-error")} onClick={() => onChange(null, null)}>
            <TrashIcon size={14} />
            پاک کردن موقعیت
          </button>
        ) : null}
      </div>

      {mapOpen && mapAvailable ? (
        <div className="flex flex-col gap-1">
          <div className="relative h-64 overflow-hidden rounded-[16px] bg-background-secondary">
            <MapErrorBoundary
              fallback={null}
              onError={() => {
                // The map chunk itself failed to load/parse: same outcome as a map that fails to start.
                setMapFailed(true);
                setManualOpen(true);
              }}
            >
              <LocationPickerMap
                value={hasValue ? { lat: latitude as number, lng: longitude as number } : null}
                onPick={(lat, lng) => onChange(lat, lng)}
                onFail={() => {
                  setMapFailed(true);
                  setManualOpen(true);
                }}
                recenterKey={recenterKey}
              />
            </MapErrorBoundary>
          </div>
          <p className="text-[11px] text-foreground-muted">روی نقشه بزنید یا نشانگر را بکشید تا دقیقاً روی ورودی سالن بنشیند.</p>
        </div>
      ) : null}

      {mapFailed ? (
        <p className="text-xs text-foreground-muted">نقشه بارگذاری نشد؛ مختصات را دستی وارد کنید یا بدون موقعیت ذخیره کنید.</p>
      ) : null}
      {gpsError ? <p className="text-xs text-error">{gpsError}</p> : null}

      {isMapConfigured && !manualOpen ? (
        <button type="button" className="self-start text-xs font-semibold text-foreground-muted" onClick={() => setManualOpen(true)}>
          ورود دستی مختصات
        </button>
      ) : null}
      {manualOpen ? (
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1 text-xs text-foreground-muted">
            عرض جغرافیایی
            <Input
              inputMode="decimal"
              dir="ltr"
              placeholder="35.7219"
              value={latText}
              className="rounded-[12px]"
              onChange={(e) => {
                setLatText(e.target.value);
                onChange(parseCoordinateInput(e.target.value), parseCoordinateInput(lngText));
              }}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-foreground-muted">
            طول جغرافیایی
            <Input
              inputMode="decimal"
              dir="ltr"
              placeholder="51.3347"
              value={lngText}
              className="rounded-[12px]"
              onChange={(e) => {
                setLngText(e.target.value);
                onChange(parseCoordinateInput(latText), parseCoordinateInput(e.target.value));
              }}
            />
          </label>
        </div>
      ) : null}

      {pairError ? <p className="text-xs text-error">{pairError}</p> : null}
    </div>
  );
}
