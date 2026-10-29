"use client";

import { useEffect, useRef } from "react";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { createMap, maplibregl } from "@/shared/map/createMap";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, FOCUS_ZOOM } from "@/shared/map/mapConfig";
import { roundCoordinate } from "@/shared/utils/coordinates";

export interface ILocationPickerMapProps {
  value: { lat: number; lng: number } | null;
  /** Click on the map, or end of a marker drag. */
  onPick: (lat: number, lng: number) => void;
  onFail: (reason: "style-error" | "timeout" | "unsupported") => void;
  /** Changing `key` re-centres the map on `value` (e.g. after «موقعیت فعلی من»). */
  recenterKey?: number;
}

/** The pin's SVG takes a plain colour, not a CSS variable: read the design token once. */
function primaryColor(): string {
  return getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim() || "#4fa39a";
}

/** MapLibre canvas for choosing one point: tap to place, drag the pin to adjust. Loaded lazily (see BranchLocationField). */
export default function LocationPickerMap({ value, onPick, onFail, recenterKey }: ILocationPickerMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const propsRef = useRef({ value, onPick, onFail });
  propsRef.current = { value, onPick, onFail };

  // Creates the draggable pin once; later moves only call setLngLat.
  const placeMarker = (map: MapLibreMap, lat: number, lng: number) => {
    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
      return;
    }
    const marker = new maplibregl.Marker({ draggable: true, color: primaryColor() }).setLngLat([lng, lat]).addTo(map);
    marker.on("dragend", () => {
      const p = marker.getLngLat();
      propsRef.current.onPick(roundCoordinate(p.lat), roundCoordinate(p.lng));
    });
    markerRef.current = marker;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const start = propsRef.current.value;
    const map = createMap(container, {
      center: start ? [start.lng, start.lat] : DEFAULT_MAP_CENTER,
      zoom: start ? FOCUS_ZOOM : DEFAULT_MAP_ZOOM,
      onFail: (reason) => propsRef.current.onFail(reason),
      onReady: (ready) => {
        const current = propsRef.current.value;
        if (current) placeMarker(ready, current.lat, current.lng);
        ready.on("click", (e) => {
          placeMarker(ready, e.lngLat.lat, e.lngLat.lng);
          propsRef.current.onPick(roundCoordinate(e.lngLat.lat), roundCoordinate(e.lngLat.lng));
        });
      },
    });
    mapRef.current = map;

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the map is created once; later changes flow through refs/effects below
  }, []);

  // The value can change outside the map (GPS button, clear): keep the pin in sync.
  const lat = value?.lat;
  const lng = value?.lng;
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (lat == null || lng == null) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }
    placeMarker(map, lat, lng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  useEffect(() => {
    const map = mapRef.current;
    const v = propsRef.current.value;
    if (!map || !v || recenterKey == null) return;
    map.easeTo({ center: [v.lng, v.lat], zoom: Math.max(map.getZoom(), FOCUS_ZOOM), duration: 500 });
  }, [recenterKey]);

  return <div ref={containerRef} className="h-full w-full" />;
}
