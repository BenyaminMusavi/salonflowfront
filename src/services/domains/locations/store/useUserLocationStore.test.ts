import { beforeEach, describe, expect, it } from "vitest";
import { USER_LOCATION_STORE_NAME, useUserLocationStore } from "./useUserLocationStore";

const city = {
  publicId: "city-teh",
  name: "تهران",
  provincePublicId: "prov-teh",
  provinceName: "تهران",
  latitude: 35.6893,
  longitude: 51.3896,
  hasDistricts: true,
};

beforeEach(() => {
  localStorage.clear();
  useUserLocationStore.setState({ manual: null, gps: null, mode: null });
});

describe("useUserLocationStore", () => {
  it("GPS never replaces the manual choice; leaving GPS returns to it", () => {
    const s = useUserLocationStore.getState();
    s.setManual(city, null);
    s.setGps({ lat: 35.7, lng: 51.4, at: 1 });

    expect(useUserLocationStore.getState().mode).toBe("gps");
    expect(useUserLocationStore.getState().manual?.city.publicId).toBe("city-teh");

    useUserLocationStore.getState().stopGps();
    expect(useUserLocationStore.getState().mode).toBe("manual");
    expect(useUserLocationStore.getState().gps).toBeNull();
  });

  it("persists only the manual choice — the device position never reaches storage", () => {
    useUserLocationStore.getState().setManual(city, null);
    useUserLocationStore.getState().setGps({ lat: 35.712345, lng: 51.398765, at: 1 });

    const stored = localStorage.getItem(USER_LOCATION_STORE_NAME) ?? "";
    expect(stored).toContain("city-teh");
    expect(stored).not.toContain("35.712345");
    expect(stored).not.toContain("gps");
  });

  it("clear forgets everything", () => {
    useUserLocationStore.getState().setManual(city, null);
    useUserLocationStore.getState().clear();
    expect(useUserLocationStore.getState()).toMatchObject({ manual: null, gps: null, mode: null });
  });

  it("a server copy adopted on another device does not switch away from an active GPS view", () => {
    useUserLocationStore.getState().setGps({ lat: 35.7, lng: 51.4, at: 1 });
    useUserLocationStore.getState().adoptServerManual({ city, district: null, updatedAt: "2026-11-05T10:00:00Z" });
    expect(useUserLocationStore.getState().mode).toBe("gps");
    expect(useUserLocationStore.getState().manual?.city.name).toBe("تهران");
  });
});
