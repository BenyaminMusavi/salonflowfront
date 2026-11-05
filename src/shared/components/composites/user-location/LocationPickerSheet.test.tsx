import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

const data = vi.hoisted(() => ({
  cities: [] as unknown[],
  districts: [] as unknown[],
  provinces: [] as unknown[],
  citiesError: false,
}));

vi.mock("@/services/domains/locations/hooks/useQueryLocations", () => ({
  useQueryCities: () => ({ data: { data: data.cities }, isLoading: false, isError: data.citiesError, refetch: vi.fn() }),
  useQueryDistricts: () => ({ data: { data: data.districts }, isLoading: false, isError: false, refetch: vi.fn() }),
  useQueryProvinces: () => ({ data: { data: data.provinces }, isLoading: false, isError: false, refetch: vi.fn() }),
}));
vi.mock("@/shared/components/composites/bottom-sheet/BottomSheet", () => ({
  default: ({ open, children }: { open: boolean; children: React.ReactNode }) => (open ? <div>{children}</div> : null),
}));

import LocationPickerSheet from "./LocationPickerSheet";
import { useUserLocationStore } from "@/services/domains/locations/store/useUserLocationStore";

const shiraz = { publicId: "c-shz", name: "شیراز", provincePublicId: "p-fars", provinceName: "فارس", latitude: 29.6, longitude: 52.5, hasDistricts: false };
const tehran = { publicId: "c-teh", name: "تهران", provincePublicId: "p-teh", provinceName: "تهران", latitude: 35.69, longitude: 51.39, hasDistricts: true };

beforeEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
  useUserLocationStore.setState({ manual: null, gps: null, mode: null });
  data.cities = [tehran, shiraz];
  data.districts = [{ publicId: "d-1", name: "سعادت آباد", latitude: 35.78, longitude: 51.37 }];
  data.provinces = [{ publicId: "p-teh", name: "تهران" }];
  data.citiesError = false;
});

describe("LocationPickerSheet", () => {
  it("a city without districts is chosen at once (whole city) and closes", () => {
    const onClose = vi.fn();
    render(<LocationPickerSheet open onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: /شیراز/ }));

    expect(useUserLocationStore.getState()).toMatchObject({ mode: "manual", manual: { city: { publicId: "c-shz" }, district: null } });
    expect(onClose).toHaveBeenCalled();
  });

  it("a city with districts opens them; a district or «همه‌ی محله‌ها» can be chosen", () => {
    render(<LocationPickerSheet open onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /تهران/ }));

    fireEvent.click(screen.getByRole("button", { name: "سعادت آباد" }));
    expect(useUserLocationStore.getState().manual?.district?.publicId).toBe("d-1");
  });

  it("whole-city option inside the district step", () => {
    render(<LocationPickerSheet open onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /تهران/ }));
    fireEvent.click(screen.getByRole("button", { name: "همه‌ی محله‌های تهران" }));
    expect(useUserLocationStore.getState().manual).toMatchObject({ city: { publicId: "c-teh" }, district: null });
  });

  it("empty reference tables: explains it and keeps the device-position option", () => {
    data.cities = [];
    render(<LocationPickerSheet open onClose={vi.fn()} />);

    expect(screen.getByText(/فهرست شهرها هنوز آماده نیست/)).toBeTruthy();
    expect(screen.getByRole("button", { name: /استفاده از موقعیت فعلی من/ })).toBeTruthy();
  });

  it("network error: offers a retry", () => {
    data.citiesError = true;
    render(<LocationPickerSheet open onClose={vi.fn()} />);
    expect(screen.getByRole("button", { name: "تلاش دوباره" })).toBeTruthy();
  });

  it("asks for GPS only on the button; the saved city survives it", async () => {
    const getCurrentPosition = vi.fn((ok: PositionCallback) => ok({ coords: { latitude: 35.7, longitude: 51.4 } } as GeolocationPosition));
    vi.stubGlobal("navigator", { geolocation: { getCurrentPosition } });
    useUserLocationStore.getState().setManual(shiraz, null);
    const onClose = vi.fn();
    render(<LocationPickerSheet open onClose={onClose} />);
    expect(getCurrentPosition).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /استفاده از موقعیت فعلی من/ }));

    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(useUserLocationStore.getState().mode).toBe("gps");
    expect(useUserLocationStore.getState().manual?.city.publicId).toBe("c-shz");
  });

  it("«پاک کردن موقعیت» forgets the choice", () => {
    useUserLocationStore.getState().setManual(shiraz, null);
    render(<LocationPickerSheet open onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /پاک کردن موقعیت/ }));
    expect(useUserLocationStore.getState().manual).toBeNull();
  });

  it("credits OpenStreetMap (ODbL)", () => {
    render(<LocationPickerSheet open onClose={vi.fn()} />);
    expect(screen.getByRole("link", { name: /OpenStreetMap/ }).getAttribute("href")).toBe("https://www.openstreetmap.org/copyright");
  });
});
