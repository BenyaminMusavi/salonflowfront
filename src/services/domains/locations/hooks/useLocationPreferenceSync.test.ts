import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

const api = vi.hoisted(() => ({
  getPreference: vi.fn(),
  savePreference: vi.fn(() => Promise.resolve()),
  deletePreference: vi.fn(() => Promise.resolve()),
}));
vi.mock("../locations.service", () => ({ default: api }));

import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useUserLocationStore } from "../store/useUserLocationStore";
import { useLocationPreferenceSync } from "./useLocationPreferenceSync";

const city = (id: string, name: string) => ({
  publicId: id,
  name,
  provincePublicId: "p",
  provinceName: "p",
  latitude: 35,
  longitude: 51,
  hasDistricts: false,
});

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  useUserLocationStore.setState({ manual: null, gps: null, mode: null });
  useTokenStore.setState({ isLoggedIn: true });
});

describe("useLocationPreferenceSync", () => {
  it("guest: no server calls at all", async () => {
    useTokenStore.setState({ isLoggedIn: false });
    renderHook(() => useLocationPreferenceSync(true));
    await new Promise((r) => setTimeout(r, 0));
    expect(api.getPreference).not.toHaveBeenCalled();
  });

  it("feature off: no server calls", async () => {
    renderHook(() => useLocationPreferenceSync(false));
    await new Promise((r) => setTimeout(r, 0));
    expect(api.getPreference).not.toHaveBeenCalled();
  });

  it("another device saved a city: this device adopts it", async () => {
    api.getPreference.mockResolvedValue({ city: city("c-shz", "شیراز"), district: null, updatedAt: "2026-11-05T10:00:00Z" });
    renderHook(() => useLocationPreferenceSync(true));
    await waitFor(() => expect(useUserLocationStore.getState().manual?.city.name).toBe("شیراز"));
    expect(api.savePreference).not.toHaveBeenCalled();
  });

  it("only this device has a choice: it is uploaded (city/district only)", async () => {
    api.getPreference.mockResolvedValue(null);
    useUserLocationStore.getState().setManual(city("c-teh", "تهران"), null, "2026-11-05T10:00:00Z");
    renderHook(() => useLocationPreferenceSync(true));
    await waitFor(() => expect(api.savePreference).toHaveBeenCalledWith({ cityPublicId: "c-teh", districtPublicId: undefined }));
  });

  it("both differ: the newer choice wins", async () => {
    api.getPreference.mockResolvedValue({ city: city("c-shz", "شیراز"), district: null, updatedAt: "2026-11-01T10:00:00Z" });
    useUserLocationStore.getState().setManual(city("c-teh", "تهران"), null, "2026-11-05T10:00:00Z");
    renderHook(() => useLocationPreferenceSync(true));
    await waitFor(() => expect(api.savePreference).toHaveBeenCalledWith({ cityPublicId: "c-teh", districtPublicId: undefined }));
    expect(useUserLocationStore.getState().manual?.city.name).toBe("تهران");
  });

  it("later changes are mirrored; «پاک کردن» deletes; GPS is never sent", async () => {
    api.getPreference.mockResolvedValue(null);
    renderHook(() => useLocationPreferenceSync(true));
    await waitFor(() => expect(api.getPreference).toHaveBeenCalled());
    await new Promise((r) => setTimeout(r, 0));

    act(() => useUserLocationStore.getState().setManual(city("c-isf", "اصفهان"), null));
    expect(api.savePreference).toHaveBeenCalledWith({ cityPublicId: "c-isf", districtPublicId: undefined });

    act(() => useUserLocationStore.getState().setGps({ lat: 35.7, lng: 51.4, at: 1 }));
    expect(api.savePreference).toHaveBeenCalledTimes(1);

    act(() => useUserLocationStore.getState().clear());
    expect(api.deletePreference).toHaveBeenCalledTimes(1);
  });
});
