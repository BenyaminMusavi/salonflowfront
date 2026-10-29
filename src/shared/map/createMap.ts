import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_LOAD_TIMEOUT_MS, MAP_STYLE_URL } from "./mapConfig";

export { maplibregl };

// MapLibre 6 derives its web-worker URL from import.meta.url, which a bundled chunk gets wrong (404 → "Worker failed to
// load"). The worker file is self-contained, so let the bundler emit it as an asset and point MapLibre at that URL.
let workerConfigured = false;
function configureWorker(): void {
  if (workerConfigured) return;
  workerConfigured = true;
  maplibregl.setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString());
}

export interface ICreateMapOptions {
  center: [number, number]; // [lng, lat]
  zoom: number;
  /** Called once when the style is ready. */
  onReady: (map: maplibregl.Map) => void;
  /** Called once if the style never loads (bad URL, offline, blocked, timeout). Single missing tiles do not count. */
  onFail: (reason: "style-error" | "timeout" | "unsupported") => void;
}

/** MapLibre 5+ renders with WebGL 2 only (iOS 15+); anything older gets the «map unavailable» fallback and the list still works. */
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
 * This module (and so MapLibre + its CSS) is only ever imported through a dynamic import, so the
 * library is downloaded only when a map is actually shown.
 */
export function createMap(container: HTMLElement, options: ICreateMapOptions): maplibregl.Map | null {
  if (!hasWebGl()) {
    options.onFail("unsupported");
    return null;
  }

  configureWorker();

  let settled = false;
  const settle = (fn: () => void) => {
    if (settled) return;
    settled = true;
    window.clearTimeout(timer);
    fn();
  };

  const map = new maplibregl.Map({
    container,
    style: MAP_STYLE_URL,
    center: options.center,
    zoom: options.zoom,
    attributionControl: { compact: true },
  });
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
