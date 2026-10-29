import type { IGetMapPinsParams, IMapBounds } from "@/services/domains/salons/types/salons.type";

const STEP = 1000; // 3 decimals ≈ 110 m

/**
 * Widens the box outward to a ~110 m grid. The request key therefore does not change for pans smaller
 * than that (no refetch storm while dragging), and the box never shrinks below what the user sees.
 */
export function snapBounds(bounds: IMapBounds): IMapBounds {
  return {
    south: Math.max(-90, Math.floor(bounds.south * STEP) / STEP),
    north: Math.min(90, Math.ceil(bounds.north * STEP) / STEP),
    west: Math.max(-180, Math.floor(bounds.west * STEP) / STEP),
    east: Math.min(180, Math.ceil(bounds.east * STEP) / STEP),
  };
}

/** A box the API accepts: finite, south < north and west < east. */
export function isUsableBounds(b: IMapBounds): boolean {
  return [b.north, b.south, b.east, b.west].every(Number.isFinite) && b.south < b.north && b.west < b.east;
}

export function buildMapPinsParams(
  bounds: IMapBounds,
  rest: Omit<IGetMapPinsParams, keyof IMapBounds>
): IGetMapPinsParams | null {
  const snapped = snapBounds(bounds);
  return isUsableBounds(snapped) ? { ...snapped, ...rest } : null;
}
