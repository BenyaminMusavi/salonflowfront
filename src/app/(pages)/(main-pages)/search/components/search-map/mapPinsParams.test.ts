import { describe, expect, it } from "vitest";
import { buildMapPinsParams, isUsableBounds, snapBounds } from "./mapPinsParams";

const view = { north: 35.80012, south: 35.60098, east: 51.50055, west: 51.20011 };

describe("snapBounds", () => {
  it("widens outward to a ~110 m grid, never shrinking the visible box", () => {
    const s = snapBounds(view);
    expect(s.north).toBeGreaterThanOrEqual(view.north);
    expect(s.south).toBeLessThanOrEqual(view.south);
    expect(s.east).toBeGreaterThanOrEqual(view.east);
    expect(s.west).toBeLessThanOrEqual(view.west);
    expect(s).toEqual({ north: 35.801, south: 35.6, east: 51.501, west: 51.2 });
  });

  it("gives the same box (same request key) for a pan smaller than the grid", () => {
    expect(snapBounds({ ...view, east: 51.50058, west: 51.20013 })).toEqual(snapBounds(view));
  });

  it("clamps to valid latitude/longitude", () => {
    const s = snapBounds({ north: 91, south: -91, east: 181, west: -181 });
    expect(s).toEqual({ north: 90, south: -90, east: 180, west: -180 });
  });
});

describe("buildMapPinsParams", () => {
  it("merges the snapped box with the shared filters", () => {
    const params = buildMapPinsParams(view, { genderType: 2, maxPrice: 50000, lat: 35.7, lng: 51.3 });
    expect(params).toMatchObject({ north: 35.801, genderType: 2, maxPrice: 50000, lat: 35.7, lng: 51.3 });
  });

  it("returns null for an unusable box instead of calling the API", () => {
    expect(buildMapPinsParams({ north: 35, south: 36, east: 51, west: 50 }, {})).toBeNull();
    expect(buildMapPinsParams({ north: Number.NaN, south: 35, east: 51, west: 50 }, {})).toBeNull();
    expect(isUsableBounds({ north: 36, south: 35, east: 50, west: 51 })).toBe(false);
  });
});
