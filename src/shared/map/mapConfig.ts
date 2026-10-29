/**
 * Map basemap config. The style URL is the only knob: a MapLibre style JSON (tiles, glyphs, sprite,
 * attribution live inside it). It is a PUBLIC value (`NEXT_PUBLIC_*`), so it must only ever hold a
 * key that the provider lets you restrict to this site's domains — never a private/secret key.
 * Unset = the map is off everywhere (the list keeps working and the «نقشه» toggle is hidden).
 */
export const MAP_STYLE_URL = process.env.NEXT_PUBLIC_MAP_STYLE_URL?.trim() ?? "";

export const isMapConfigured = MAP_STYLE_URL.length > 0;

/** Used only when there is no GPS point and no salon with coordinates to frame (Tehran). */
export const DEFAULT_MAP_CENTER: [number, number] = [51.389, 35.6892]; // [lng, lat]
export const DEFAULT_MAP_ZOOM = 11;

/** A map whose style never finishes loading is treated as failed after this long. */
export const MAP_LOAD_TIMEOUT_MS = 12_000;

/** Pins closer than this zoom are clustered; at/after it every branch is its own pin. */
export const CLUSTER_MAX_ZOOM = 14;

/** Zoom used when focusing a single branch (must be > CLUSTER_MAX_ZOOM so its pin is not hidden in a cluster). */
export const FOCUS_ZOOM = 15;
