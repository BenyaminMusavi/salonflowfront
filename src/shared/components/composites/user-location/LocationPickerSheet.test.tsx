import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";

const data = vi.hoisted(() => ({
  cities: [] as { publicId: string; name: string; provincePublicId: string; hasDistricts: boolean }[],
  districts: {} as Record<string, unknown[]>,
  provinces: [] as unknown[],
  citiesError: false,
  cityQueries: [] as Record<string, unknown>[],
}));

vi.mock("@/services/domains/locations/hooks/useQueryLocations", () => ({
  useQueryCities: (params: { provincePublicId?: string; search?: string }) => {
    data.cityQueries.push(params);
    const items = params.provincePublicId ? data.cities.filter((c) => c.provincePublicId === params.provincePublicId) : data.cities;
    return { data: { data: items }, isLoading: false, isError: data.citiesError, isPlaceholderData: false, refetch: vi.fn() };
  },
  useQueryDistricts: (cityPublicId: string) => ({ data: { data: data.districts[cityPublicId] ?? [] }, isLoading: false, isError: false, refetch: vi.fn() }),
  useQueryProvinces: () => ({ data: { data: data.provinces }, isLoading: false, isError: false, refetch: vi.fn() }),
}));
vi.mock("@/shared/components/composites/bottom-sheet/BottomSheet", () => ({
  default: ({ open, children }: { open: boolean; children: React.ReactNode }) => (open ? <div>{children}</div> : null),
}));

import LocationPickerSheet, { type ILocationPickerInitial } from "./LocationPickerSheet";
import BranchAreaField, { type IBranchAreaValue } from "./BranchAreaField";
import { useUserLocationStore } from "@/services/domains/locations/store/useUserLocationStore";

const city = (publicId: string, name: string, provincePublicId: string, hasDistricts: boolean) => ({
  publicId, name, provincePublicId, provinceName: provincePublicId, latitude: 35, longitude: 51, hasDistricts,
});
const tehran = city("c-teh", "تهران", "p-teh", true);
const eslamshahr = city("c-esl", "اسلامشهر", "p-teh", false);
const shiraz = city("c-shz", "شیراز", "p-fars", false);
const marvdasht = city("c-mrv", "مرودشت", "p-fars", false);

const click = (name: string | RegExp) => fireEvent.click(screen.getByRole("button", { name }));
const heading = () => screen.getByRole("heading").textContent;

beforeEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
  useUserLocationStore.setState({ manual: null, gps: null, mode: null });
  data.cities = [tehran, eslamshahr, shiraz, marvdasht];
  data.districts = {
    "c-teh": [
      { publicId: "d-saadat", name: "سعادت آباد", latitude: 35.78, longitude: 51.37 },
      { publicId: "d-narmak", name: "نارمک", latitude: 35.73, longitude: 51.5 },
    ],
  };
  data.provinces = [{ publicId: "p-fars", name: "فارس" }, { publicId: "p-teh", name: "تهران" }];
  data.citiesError = false;
  data.cityQueries = [];
});

function PickHarness({ initial, onPick }: { initial?: ILocationPickerInitial; onPick: (c: unknown, d: unknown) => void }) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>reopen</button>
      <LocationPickerSheet open={open} onClose={() => setOpen(false)} title="شهر و محله‌ی شعبه" initial={initial} onPick={onPick} />
    </>
  );
}

describe("LocationPickerSheet — branch (pick) mode: province → city → district", () => {
  it("1. from the start: province, then only its cities, then the district; nothing is applied before the last tap", () => {
    const onPick = vi.fn();
    render(<PickHarness onPick={onPick} />);
    expect(heading()).toBe("شهر و محله‌ی شعبه");

    click(/تهران/);
    expect(heading()).toBe("انتخاب شهر");
    expect(screen.queryByRole("button", { name: /شیراز/ })).toBeNull(); // another province's city
    expect(onPick).not.toHaveBeenCalled();

    click(/^تهران/);
    expect(heading()).toBe("انتخاب محله");
    expect(screen.getByText("تهران › تهران")).toBeTruthy(); // the path stays visible

    click("نارمک");
    expect(onPick).toHaveBeenCalledWith(tehran, expect.objectContaining({ publicId: "d-narmak" }));
  });

  it("district is optional: «بدون تعیین محله»", () => {
    const onPick = vi.fn();
    render(<PickHarness onPick={onPick} />);
    click(/تهران/);
    click(/^تهران/);
    click("بدون تعیین محله");
    expect(onPick).toHaveBeenCalledWith(tehran, null);
  });

  it("2. back from district to city keeps the province; another city is chosen without restarting", () => {
    const onPick = vi.fn();
    render(<PickHarness onPick={onPick} />);
    click(/تهران/);
    click(/^تهران/);

    click("بازگشت");
    expect(heading()).toBe("انتخاب شهر");
    click(/اسلامشهر/); // no districts → done at once

    expect(onPick).toHaveBeenCalledWith(eslamshahr, null);
  });

  it("3. changing the province after a city and district: the new province's cities only", () => {
    const onPick = vi.fn();
    render(<PickHarness onPick={onPick} />);
    click(/تهران/);
    click(/^تهران/);
    click("بازگشت");
    click("بازگشت");
    expect(heading()).toBe("شهر و محله‌ی شعبه");

    click(/فارس/);
    expect(screen.queryByRole("button", { name: /اسلامشهر/ })).toBeNull();
    click(/مرودشت/);
    expect(onPick).toHaveBeenCalledWith(marvdasht, null);
  });

  it("4. closing changes nothing; reopening starts from the branch's own value, highlighted", () => {
    const onPick = vi.fn();
    render(<PickHarness onPick={onPick} initial={{ provincePublicId: "p-teh", cityPublicId: "c-teh", districtPublicId: "d-saadat" }} />);
    expect(heading()).toBe("انتخاب شهر");
    expect(screen.getByRole("button", { name: /^تهران/ }).getAttribute("aria-current")).toBe("true");

    click("لغو");
    expect(screen.queryByRole("heading")).toBeNull();
    expect(onPick).not.toHaveBeenCalled();

    click("reopen");
    click(/^تهران/);
    expect(screen.getByRole("button", { name: "سعادت آباد" }).getAttribute("aria-current")).toBe("true");
  });

  it("5. city search filters the province's list on the device (no request per keystroke)", () => {
    const onPick = vi.fn();
    render(<PickHarness onPick={onPick} />);
    click(/فارس/);
    const before = data.cityQueries.length;

    fireEvent.change(screen.getByLabelText("جستجوی شهر"), { target: { value: "مرو" } });

    expect(screen.queryByRole("button", { name: /شیراز/ })).toBeNull();
    expect(data.cityQueries.slice(before).every((q) => q.provincePublicId === "p-fars" && !q.search)).toBe(true);
    click(/مرودشت/);
    expect(onPick).toHaveBeenCalledWith(marvdasht, null);
  });

  it("8. each step keeps its own search: going back shows the list as the user left it", () => {
    render(<PickHarness onPick={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("جستجوی استان"), { target: { value: "تهر" } });
    click(/تهران/);
    fireEvent.change(screen.getByLabelText("جستجوی شهر"), { target: { value: "اسلام" } });
    click("بازگشت");

    expect((screen.getByLabelText("جستجوی استان") as HTMLInputElement).value).toBe("تهر");
    expect(screen.queryByRole("button", { name: /فارس/ })).toBeNull();
    click(/تهران/);
    expect((screen.getByLabelText("جستجوی شهر") as HTMLInputElement).value).toBe("اسلام");
  });

  it("empty reference tables: says so, the form's text box still works", () => {
    data.provinces = [];
    render(<PickHarness onPick={vi.fn()} />);
    expect(screen.getByText(/فهرست استان‌ها هنوز آماده نیست/)).toBeTruthy();
  });

  it("credits OpenStreetMap (ODbL)", () => {
    render(<PickHarness onPick={vi.fn()} />);
    expect(screen.getByRole("link", { name: /OpenStreetMap/ }).getAttribute("href")).toBe("https://www.openstreetmap.org/copyright");
  });
});

describe("BranchAreaField — several branches", () => {
  function TwoBranches() {
    const empty: IBranchAreaValue = { city: "", cityPublicId: null, districtPublicId: null, districtName: null, provincePublicId: null };
    const [a, setA] = useState<IBranchAreaValue>(empty);
    const [b, setB] = useState<IBranchAreaValue>({ city: "تهران", cityPublicId: "c-teh", districtPublicId: "d-narmak", districtName: "نارمک", provincePublicId: "p-teh" });
    return (
      <>
        <section aria-label="شعبه ۱"><BranchAreaField value={a} onChange={setA} /></section>
        <section aria-label="شعبه ۲"><BranchAreaField value={b} onChange={setB} /></section>
      </>
    );
  }

  it("6/7. each branch picks on its own; editing the existing branch starts from its own value", () => {
    render(<TwoBranches />);
    const first = within(screen.getByRole("region", { name: "شعبه ۱" }));
    const second = within(screen.getByRole("region", { name: "شعبه ۲" }));

    fireEvent.click(first.getByRole("button", { name: /انتخاب شهر و محله از فهرست/ }));
    expect(heading()).toBe("شهر و محله‌ی شعبه"); // a new branch starts at the province list
    click(/فارس/);
    click(/شیراز/);

    expect(first.getByText(/شیراز \(همه‌ی محله‌ها\)/)).toBeTruthy();
    expect(second.getByText("محله‌ی نارمک، تهران")).toBeTruthy(); // untouched

    fireEvent.click(second.getByRole("button", { name: "تغییر" }));
    expect(heading()).toBe("انتخاب شهر"); // the second branch's own province
    expect(screen.getByRole("button", { name: /^تهران/ }).getAttribute("aria-current")).toBe("true");
  });
});

describe("LocationPickerSheet — user location mode", () => {
  it("a city without districts is chosen at once and becomes the saved choice", () => {
    const onClose = vi.fn();
    render(<LocationPickerSheet open onClose={onClose} />);
    click(/شیراز/);
    expect(useUserLocationStore.getState()).toMatchObject({ mode: "manual", manual: { city: { publicId: "c-shz" }, district: null } });
    expect(onClose).toHaveBeenCalled();
  });

  it("a city with districts opens them, including «همه‌ی محله‌ها»", () => {
    render(<LocationPickerSheet open onClose={vi.fn()} />);
    click(/^تهران/);
    click("همه‌ی محله‌های تهران");
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

    click(/استفاده از موقعیت فعلی من/);

    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(useUserLocationStore.getState().mode).toBe("gps");
    expect(useUserLocationStore.getState().manual?.city.publicId).toBe("c-shz");
  });

  it("«پاک کردن موقعیت» forgets the choice", () => {
    useUserLocationStore.getState().setManual(shiraz, null);
    render(<LocationPickerSheet open onClose={vi.fn()} />);
    click(/پاک کردن موقعیت/);
    expect(useUserLocationStore.getState().manual).toBeNull();
  });
});
