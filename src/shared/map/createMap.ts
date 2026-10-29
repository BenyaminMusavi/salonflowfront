import maplibregl from "@neshan-maps-platform/maplibre-sdk";
import "@neshan-maps-platform/maplibre-sdk/style.css";
import { MAP_API_KEY, MAP_LOAD_TIMEOUT_MS, MAP_STYLE_URL } from "./mapConfig";

/**
 * Neshan's SDK is MapLibre GL JS 6 plus the `nsh://` tile protocol (decodes Neshan's encoded tiles, adds the access key to
 * every tile request) and the required Neshan logo/attribution. It is used exactly like plain maplibre-gl, so the rest of
 * the app only talks to `maplibregl` from here — the one place that knows which map SDK is behind it.
 */
export { maplibregl };

export type MlMap = InstanceType<typeof maplibregl.Map>;
export type MlMarker = InstanceType<typeof maplibregl.Marker>;
export type MlGeoJSONSource = InstanceType<typeof maplibregl.GeoJSONSource>;

export interface ICreateMapOptions {
  center: [number, number]; // [lng, lat]
  zoom: number;
  /** Called once when the style is ready. */
  onReady: (map: MlMap) => void;
  /** Called once if the style never loads (bad key/URL, offline, blocked, timeout). Single missing tiles do not count. */
  onFail: (reason: "style-error" | "timeout" | "unsupported") => void;
}

/** MapLibre 6 renders with WebGL 2 only (iOS 15+); anything older gets the «map unavailable» fallback and the list still works. */
function hasWebGl(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    // The probe context would otherwise stay alive until GC; browsers cap live contexts (~16), and the map is opened repeatedly.
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

/**
 * Creates the map inside `container`. The caller owns the returned map and must `remove()` it.
 * This module (and so the SDK + its CSS) is only ever imported through a dynamic import, so it is downloaded only when a
 * map is actually shown.
 */
export function createMap(container: HTMLElement, options: ICreateMapOptions): MlMap | null {
  if (!hasWebGl()) {
    options.onFail("unsupported");
    return null;
  }

  let settled = false;
  const settle = (fn: () => void) => {
    if (settled) return;
    settled = true;
    window.clearTimeout(timer);
    fn();
  };

  let map: MlMap;
  try {
    // `apiKey` is required by the SDK: a missing/blank key throws here (the app also hides every map entry point without it).
    map = new maplibregl.Map({
      container,
      style: MAP_STYLE_URL,
      center: options.center,
      zoom: options.zoom,
      apiKey: MAP_API_KEY,
      attributionControl: { compact: true },
    });
  } catch {
    options.onFail("style-error");
    return null;
  }
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");

  // A tab in the background gets no animation frames, so MapLibre cannot finish loading; wait for it to be visible
  // instead of reporting a failure the user never caused.
  const arm = (): number =>
    window.setTimeout(() => {
      if (document.visibilityState === "hidden") timer = arm();
      else settle(() => options.onFail("timeout"));
    }, MAP_LOAD_TIMEOUT_MS);
  let timer = arm();

  // A map removed before it settled (unmount, React StrictMode's double mount) must not report a failure later.
  map.once("remove", () => {
    settled = true;
    window.clearTimeout(timer);
  });
  map.once("load", () => settle(() => options.onReady(map)));
  map.on("error", () => {
    // Before the style is ready any error means the map cannot be shown; afterwards a failed tile is just a gap.
    if (!settled && !map.isStyleLoaded()) settle(() => options.onFail("style-error"));
  });

  return map;
}
