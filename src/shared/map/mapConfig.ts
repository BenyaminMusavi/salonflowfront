/**
 * Basemap config (Neshan). Two PUBLIC values, both inlined at build time (`NEXT_PUBLIC_*`):
 *  - `NEXT_PUBLIC_NESHAN_MAP_KEY` — the Neshan «map» access key from platform.neshan.org. It is sent with every tile request from the
 *    browser, so it is a quota/access key to restrict to this site's domains in the Neshan panel — never a secret or service key.
 *  - `NEXT_PUBLIC_MAP_STYLE_URL` — optional; a MapLibre style hosted by Neshan (light.json by default; dark.json, pastel.json…).
 * Without the key the map is off everywhere (the list keeps working, the «نقشه» toggle is hidden, branch forms use typed coordinates).
 */
export const MAP_API_KEY = process.env.NEXT_PUBLIC_NESHAN_MAP_KEY?.trim() ?? "";

export const MAP_STYLE_URL =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL?.trim() || "https://static.neshan.org/sdk/maplibre/styles/light.json";

export const isMapConfigured = MAP_API_KEY.length > 0;

/** Used only when there is no GPS point and no salon with coordinates to frame (Tehran). */
export const DEFAULT_MAP_CENTER: [number, number] = [51.389, 35.6892]; // [lng, lat]
export const DEFAULT_MAP_ZOOM = 11;

/** A map whose style never finishes loading is treated as failed after this long. */
export const MAP_LOAD_TIMEOUT_MS = 12_000;

/** Pins closer than this zoom are clustered; at/after it every branch is its own pin. */
export const CLUSTER_MAX_ZOOM = 14;

/** Zoom used when focusing a single branch (must be > CLUSTER_MAX_ZOOM so its pin is not hidden in a cluster). */
export const FOCUS_ZOOM = 15;
