import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

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
  it("without a location: only one compact row, no big card, no request, and GPS is never asked by itself", () => {
    const getCurrentPosition = vi.fn();
    vi.stubGlobal("navigator", { geolocation: { getCurrentPosition } });

    render(<HomeNearbySalons />);

    expect(screen.getByRole("button", { name: "موقعیتت رو انتخاب کن" })).toBeTruthy();
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.queryByText(/موقعیت فعلی من/)).toBeNull();
    expect(last().enabled).toBe(false);
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  it("the row opens the shared picker (device position and city/district live there)", () => {
    render(<HomeNearbySalons />);
    fireEvent.click(screen.getByRole("button", { name: "موقعیتت رو انتخاب کن" }));
    expect(screen.getByTestId("picker")).toBeTruthy();
  });

  it("device position: the row says so; nearby salons within 20 km from a rounded point, and «همه» keeps the radius", () => {
    useUserLocationStore.getState().setGps({ lat: 35.712345, lng: 51.398765, at: 1 });
    salons.items = [{ id: "s1", name: "سالن نزدیک" }];
    render(<HomeNearbySalons />);

    expect(screen.getByRole("button", { name: /موقعیت فعلی شما/ })).toBeTruthy();
    expect(screen.getByText("سالن نزدیک")).toBeTruthy();
    expect(last().params).toMatchObject({ lat: 35.712, lng: 51.399, radiusKm: 20 });
    expect(last().params.cityPublicId).toBeUndefined();
    expect(screen.getByRole("link", { name: "همه" }).getAttribute("href")).toBe("/search?radiusKm=20");
  });

  it("manual choice: the row shows district and city (tap to change); that area is listed without any position", () => {
    useUserLocationStore.getState().setManual(tehran, { publicId: "d-1", name: "سعادت آباد", latitude: 35.78, longitude: 51.37 });
    render(<HomeNearbySalons />);

    const row = screen.getByRole("button", { name: /سعادت آباد، تهران/ });
    expect(row.textContent).toContain("سعادت آباد، تهران");
    expect(last()).toMatchObject({ enabled: true, params: { cityPublicId: "c-teh", districtPublicId: "d-1" } });
    expect(last().params.lat).toBeUndefined();

    fireEvent.click(row);
    expect(screen.getByTestId("picker")).toBeTruthy();
  });

  it("no salon in the area: one short line, no card or extra buttons", () => {
    useUserLocationStore.getState().setManual(tehran, null);
    render(<HomeNearbySalons />);

    expect(screen.getByText("در این محدوده هنوز سالنی در صفا نیست.")).toBeTruthy();
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("device far from the saved city: only a short suggestion — the saved city is not replaced", () => {
    useUserLocationStore.getState().setManual(tehran, null);
    useUserLocationStore.getState().setGps({ lat: 29.61, lng: 52.54, at: 1 });
    render(<HomeNearbySalons />);

    expect(screen.getByText(/دور از «تهران» هستید؟/)).toBeTruthy();
    expect(useUserLocationStore.getState().manual?.city.name).toBe("تهران");
  });
});
