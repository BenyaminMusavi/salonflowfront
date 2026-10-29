"use client";

import { useEffect, useRef } from "react";
import type { GeoJSONSource, Map as MapLibreMap, Marker } from "maplibre-gl";
import { createMap, maplibregl } from "@/shared/map/createMap";
import { CLUSTER_MAX_ZOOM, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, FOCUS_ZOOM } from "@/shared/map/mapConfig";
import {
  applyPinStyle,
  createClusterElement,
  createPinElement,
  createUserDotElement,
} from "@/shared/map/markerElements";
import type { IMapBounds, ISalonMapPin } from "@/services/domains/salons/types/salons.type";

const SOURCE = "salon-pins";
const BOUNDS_DEBOUNCE_MS = 350;

export type TMapFailReason = "style-error" | "timeout" | "unsupported";

export interface ISearchMapProps {
  pins: ISalonMapPin[];
  /** Branch (not salon) currently selected; highlighted on the map. */
  selectedBranchId: string | null;
  onSelectBranch: (branchPublicId: string) => void;
  /** Fired (debounced) once the map is ready and after every pan/zoom. */
  onBoundsChange: (bounds: IMapBounds) => void;
  onFail: (reason: TMapFailReason) => void;
  /** The user's GPS point, if they asked for it. Shown as a blue dot; also where the map opens. */
  reference: { lat: number; lng: number } | null;
  /** Frame these [lng, lat] points on open when there is no GPS point (the salons of the list). */
  fitPoints: [number, number][];
  /** Changing `key` flies to the point at pin zoom (selecting a card). */
  focus: { lat: number; lng: number; key: number } | null;
}

function toFeatureCollection(pins: ISalonMapPin[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: pins.map((p) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [p.longitude, p.latitude] },
      properties: { id: p.branchPublicId, name: p.name, gender: p.genderType },
    })),
  };
}

function clampBounds(map: MapLibreMap): IMapBounds {
  const b = map.getBounds();
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  return {
    north: clamp(b.getNorth(), -90, 90),
    south: clamp(b.getSouth(), -90, 90),
    east: clamp(b.getEast(), -180, 180),
    west: clamp(b.getWest(), -180, 180),
  };
}

/**
 * The MapLibre canvas: clustered GeoJSON source + HTML markers (shape + glyph + colour per branch audience).
 * This file is only ever loaded through `next/dynamic` when the «نقشه» view is opened.
 */
export default function SearchMap(props: ISearchMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const readyRef = useRef(false);
  const markersRef = useRef(new Map<string, { marker: Marker; el: HTMLElement }>());
  const userMarkerRef = useRef<Marker | null>(null);
  // Always-current props for the long-lived map callbacks.
  const propsRef = useRef(props);
  propsRef.current = props;

  // ---- create the map once ----
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let boundsTimer: number | undefined;
    let raf = 0;
    const markers = markersRef.current;

    const syncMarkers = () => {
      raf = 0;
      const map = mapRef.current;
      if (!map || !readyRef.current || !map.getSource(SOURCE) || !map.isSourceLoaded(SOURCE)) return;

      const visible = new Set<string>();
      for (const feature of map.querySourceFeatures(SOURCE)) {
        const p = feature.properties as Record<string, unknown>;
        const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates;
        const isCluster = !!p.cluster;
        const id = isCluster ? `cluster-${p.cluster_id}-${p.point_count}` : String(p.id);
        if (visible.has(id)) continue;
        visible.add(id);
        if (markers.has(id)) continue;

        let el: HTMLElement;
        if (isCluster) {
          el = createClusterElement(Number(p.point_count));
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            const source = map.getSource(SOURCE) as GeoJSONSource;
            void source.getClusterExpansionZoom(Number(p.cluster_id)).then((zoom) => {
              map.easeTo({ center: [lng, lat], zoom: Math.min(zoom + 0.5, FOCUS_ZOOM) });
            });
          });
        } else {
          const selected = propsRef.current.selectedBranchId === id;
          el = createPinElement(Number(p.gender), String(p.name), selected);
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            propsRef.current.onSelectBranch(id);
          });
        }
        const marker = new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
        markers.set(id, { marker, el });
      }
      for (const [id, entry] of markers) {
        if (!visible.has(id)) {
          entry.marker.remove();
          markers.delete(id);
        }
      }
    };
    const scheduleSync = () => {
      if (!raf) raf = window.requestAnimationFrame(syncMarkers);
    };

    const emitBounds = (map: MapLibreMap) => {
      window.clearTimeout(boundsTimer);
      boundsTimer = window.setTimeout(() => propsRef.current.onBoundsChange(clampBounds(map)), BOUNDS_DEBOUNCE_MS);
    };

    const start = propsRef.current.reference;
    const map = createMap(container, {
      center: start ? [start.lng, start.lat] : DEFAULT_MAP_CENTER,
      zoom: start ? 13 : DEFAULT_MAP_ZOOM,
      onFail: (reason) => propsRef.current.onFail(reason),
      onReady: (ready) => {
        ready.addSource(SOURCE, {
          type: "geojson",
          data: toFeatureCollection(propsRef.current.pins),
          cluster: true,
          clusterRadius: 55,
          clusterMaxZoom: CLUSTER_MAX_ZOOM,
        });
        // The source only loads tiles while a layer uses it; markers are HTML, so this layer draws nothing.
        ready.addLayer({ id: `${SOURCE}-hidden`, type: "circle", source: SOURCE, paint: { "circle-radius": 0, "circle-opacity": 0 } });
        readyRef.current = true;

        const { fitPoints } = propsRef.current;
        if (!propsRef.current.reference && fitPoints.length > 0) {
          const b = new maplibregl.LngLatBounds(fitPoints[0], fitPoints[0]);
          fitPoints.forEach((pt) => b.extend(pt));
          ready.fitBounds(b, { padding: 48, maxZoom: 14, duration: 0 });
        }
        ready.on("render", scheduleSync);
        ready.on("moveend", () => emitBounds(ready));
        emitBounds(ready);
      },
    });
    mapRef.current = map;

    return () => {
      window.clearTimeout(boundsTimer);
      if (raf) window.cancelAnimationFrame(raf);
      markers.forEach((entry) => entry.marker.remove());
      markers.clear();
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      readyRef.current = false;
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  // ---- new pins ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    (map.getSource(SOURCE) as GeoJSONSource | undefined)?.setData(toFeatureCollection(props.pins));
  }, [props.pins]);

  // ---- selection highlight ----
  useEffect(() => {
    markersRef.current.forEach((entry, id) => {
      if (id.startsWith("cluster-")) return;
      const pin = props.pins.find((p) => p.branchPublicId === id);
      applyPinStyle(entry.el, pin?.genderType, id === props.selectedBranchId);
    });
  }, [props.selectedBranchId, props.pins]);

  // ---- fly to a chosen card ----
  const focusKey = props.focus?.key;
  useEffect(() => {
    const map = mapRef.current;
    const focus = propsRef.current.focus;
    if (!map || !focus) return;
    map.easeTo({ center: [focus.lng, focus.lat], zoom: Math.max(map.getZoom(), FOCUS_ZOOM), duration: 600 });
  }, [focusKey]);

  // ---- the user's own point ----
  const refLat = props.reference?.lat;
  const refLng = props.reference?.lng;
  useEffect(() => {
    userMarkerRef.current?.remove();
    userMarkerRef.current = null;
    const map = mapRef.current;
    if (!map || refLat == null || refLng == null) return;
    userMarkerRef.current = new maplibregl.Marker({ element: createUserDotElement() }).setLngLat([refLng, refLat]).addTo(map);
  }, [refLat, refLng]);

  return <div ref={containerRef} className="h-full w-full" />;
}
