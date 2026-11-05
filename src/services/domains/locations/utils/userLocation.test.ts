import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GPS_ERRORS,
  coarseCoordinate,
  isFarFromSavedCity,
  locationLabel,
  locationSearchParams,
  requestDevicePosition,
} from "./userLocation";
import type { IManualLocation } from "../store/useUserLocationStore";

const tehran = {
  publicId: "city-teh",
  name: "تهران",
  provincePublicId: "prov-teh",
  provinceName: "تهران",
  latitude: 35.6893,
  longitude: 51.3896,
  hasDistricts: true,
};
const manual: IManualLocation = {
  city: tehran,
  district: { publicId: "d-1", name: "سعادت آباد", latitude: 35.786, longitude: 51.378 },
  updatedAt: "2026-11-05T10:00:00Z",
};
const gps = { lat: 35.712345678, lng: 51.398765432, at: 1 };

describe("locationSearchParams", () => {
  it("GPS mode sends only a rounded position (≈110 m), never the saved city", () => {
    expect(locationSearchParams({ mode: "gps", gps, manual })).toEqual({ lat: 35.712, lng: 51.399 });
  });

  it("manual mode sends the city and district, never a position", () => {
    expect(locationSearchParams({ mode: "manual", gps, manual })).toEqual({ cityPublicId: "city-teh", districtPublicId: "d-1" });
  });

  it("a whole-city choice sends no district", () => {
    expect(locationSearchParams({ mode: "manual", gps: null, manual: { ...manual, district: null } })).toEqual({
      cityPublicId: "city-teh",
      districtPublicId: undefined,
    });
  });

  it("nothing set sends nothing", () => {
    expect(locationSearchParams({ mode: null, gps: null, manual: null })).toEqual({});
  });
});

describe("locationLabel", () => {
  it("shows district and city, the city alone, or «موقعیت فعلی شما»", () => {
    expect(locationLabel({ mode: "manual", gps: null, manual })).toBe("سعادت آباد، تهران");
    expect(locationLabel({ mode: "manual", gps: null, manual: { ...manual, district: null } })).toBe("تهران");
    expect(locationLabel({ mode: "gps", gps, manual })).toBe("موقعیت فعلی شما");
    expect(locationLabel({ mode: null, gps: null, manual: null })).toBeNull();
  });
});

describe("isFarFromSavedCity", () => {
  it("only suggests a change when the device is more than 40 km from the saved city", () => {
    expect(isFarFromSavedCity({ lat: 35.75, lng: 51.4, at: 1 }, manual)).toBe(false);
    expect(isFarFromSavedCity({ lat: 29.61, lng: 52.54, at: 1 }, manual)).toBe(true); // شیراز
    expect(isFarFromSavedCity(null, manual)).toBe(false);
  });
});

it("coarseCoordinate keeps three decimals", () => {
  expect(coarseCoordinate(35.68949)).toBe(35.689);
});

describe("requestDevicePosition", () => {
  afterEach(() => vi.unstubAllGlobals());

  const withGeolocation = (impl: (ok: PositionCallback, fail: PositionErrorCallback) => void) =>
    vi.stubGlobal("navigator", { geolocation: { getCurrentPosition: vi.fn(impl) } });

  it("resolves with the position", async () => {
    withGeolocation((ok) => ok({ coords: { latitude: 35.7, longitude: 51.4 } } as GeolocationPosition));
    await expect(requestDevicePosition()).resolves.toMatchObject({ lat: 35.7, lng: 51.4 });
  });

  it.each([
    [1, GPS_ERRORS.denied],
    [2, GPS_ERRORS.unavailable],
    [3, GPS_ERRORS.timeout],
  ])("maps error code %i to a Persian message", async (code, message) => {
    withGeolocation((_ok, fail) => fail({ code } as GeolocationPositionError));
    await expect(requestDevicePosition()).rejects.toThrow(message);
  });

  it("explains when the browser has no geolocation", async () => {
    vi.stubGlobal("navigator", {});
    await expect(requestDevicePosition()).rejects.toThrow(GPS_ERRORS.unsupported);
  });
});
