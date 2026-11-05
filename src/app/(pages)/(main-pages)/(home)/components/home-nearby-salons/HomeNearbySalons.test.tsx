import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const salons = vi.hoisted(() => ({ items: [] as unknown[], calls: [] as { params: Record<string, unknown>; enabled: boolean }[] }));

vi.mock("@/services/domains/locations/utils/userLocation", async (orig) => ({
  ...(await orig<typeof import("@/services/domains/locations/utils/userLocation")>()),
  isLocationFeatureEnabled: true,
}));
vi.mock("@/services/domains/salons/hooks/useQueryApprovedSalons", () => ({
  useQueryApprovedSalons: (params: Record<string, unknown>, enabled: boolean) => {
    salons.calls.push({ params, enabled });
    return { data: { data: { items: salons.items } }, isLoading: false, isError: false, isPlaceholderData: false };
  },
}));
vi.mock("@/app/(pages)/(main-pages)/search/components/search-card-grid/SearchCardGrid", () => ({
  default: ({ salons: list }: { salons: { name: string }[] }) => <ul>{list.map((s) => <li key={s.name}>{s.name}</li>)}</ul>,
}));
vi.mock("@/shared/components/composites/user-location/LocationPickerSheet", () => ({
  default: ({ open }: { open: boolean }) => (open ? <div data-testid="picker" /> : null),
}));
vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a> }));

import HomeNearbySalons from "./HomeNearbySalons";
import { useUserLocationStore } from "@/services/domains/locations/store/useUserLocationStore";

const tehran = { publicId: "c-teh", name: "تهران", provincePublicId: "p", provinceName: "تهران", latitude: 35.69, longitude: 51.39, hasDistricts: true };
const last = () => salons.calls.at(-1)!;

beforeEach(() => {
  vi.unstubAllGlobals();
  salons.items = [];
  salons.calls = [];
  localStorage.clear();
  useUserLocationStore.setState({ manual: null, gps: null, mode: null });
});

describe("HomeNearbySalons", () => {
  it("without a location: a prompt with both ways to set it, no salon request, and GPS is not asked by itself", () => {
    const getCurrentPosition = vi.fn();
    vi.stubGlobal("navigator", { geolocation: { getCurrentPosition } });

    render(<HomeNearbySalons />);

    expect(screen.getByRole("button", { name: /موقعیت فعلی من/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /انتخاب شهر و محله/ })).toBeTruthy();
    expect(last().enabled).toBe(false);
    expect(getCurrentPosition).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /انتخاب شهر و محله/ }));
    expect(screen.getByTestId("picker")).toBeTruthy();
  });

  it("tapping «موقعیت فعلی من» asks once and lists nearby salons with a radius and a rounded position", async () => {
    vi.stubGlobal("navigator", {
      geolocation: { getCurrentPosition: vi.fn((ok: PositionCallback) => ok({ coords: { latitude: 35.712345, longitude: 51.398765 } } as GeolocationPosition)) },
    });
    salons.items = [{ id: "s1", name: "سالن نزدیک" }];
    render(<HomeNearbySalons />);

    fireEvent.click(screen.getByRole("button", { name: /موقعیت فعلی من/ }));

    await waitFor(() => expect(screen.getByText("سالن نزدیک")).toBeTruthy());
    expect(last().params).toMatchObject({ lat: 35.712, lng: 51.399, radiusKm: 20 });
    expect(last().params.cityPublicId).toBeUndefined();
    expect(screen.getByRole("link", { name: "همه" }).getAttribute("href")).toBe("/search?radiusKm=20");
  });

  it("GPS denied: a clear message, and the manual choice stays available", async () => {
    vi.stubGlobal("navigator", {
      geolocation: { getCurrentPosition: vi.fn((_ok: PositionCallback, fail: PositionErrorCallback) => fail({ code: 1 } as GeolocationPositionError)) },
    });
    render(<HomeNearbySalons />);

    fireEvent.click(screen.getByRole("button", { name: /موقعیت فعلی من/ }));

    expect((await screen.findByRole("alert")).textContent).toContain("اجازه‌ی دسترسی");
    expect(screen.getByRole("button", { name: /انتخاب شهر و محله/ })).toBeTruthy();
  });

  it("manual choice: lists that area without any position, and says so when it is empty", () => {
    useUserLocationStore.getState().setManual(tehran, { publicId: "d-1", name: "سعادت آباد", latitude: 35.78, longitude: 51.37 });
    render(<HomeNearbySalons />);

    expect(last()).toMatchObject({ enabled: true, params: { cityPublicId: "c-teh", districtPublicId: "d-1" } });
    expect(last().params.lat).toBeUndefined();
    expect(last().params.radiusKm).toBeUndefined();
    expect(screen.getByRole("heading").textContent).toBe("سالن‌های سعادت آباد");
    expect(screen.getByText("در این محدوده هنوز سالنی در صفا نیست.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "تغییر موقعیت" })).toBeTruthy();
  });

  it("device far from the saved city: only a suggestion — the saved city is not replaced", () => {
    useUserLocationStore.getState().setManual(tehran, null);
    useUserLocationStore.getState().setGps({ lat: 29.61, lng: 52.54, at: 1 });
    render(<HomeNearbySalons />);

    expect(screen.getByText(/از «تهران» دور هستید/)).toBeTruthy();
    expect(useUserLocationStore.getState().manual?.city.name).toBe("تهران");
  });
});
