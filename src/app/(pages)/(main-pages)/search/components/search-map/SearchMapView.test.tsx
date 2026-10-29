import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ISalonMapPin } from "@/services/domains/salons/types/salons.type";

const pin = (n: number, genderType: number): ISalonMapPin => ({
  id: `salon-${n}`,
  username: `s${n}`,
  name: `سالن ${n}`,
  rating: 4.5,
  reviewCount: 3,
  branchPublicId: `branch-${n}`,
  branchName: `شعبه ${n}`,
  latitude: 35.7 + n / 100,
  longitude: 51.3,
  genderType,
  distanceKm: null,
});

type TQuery = {
  data?: { data: { items: ISalonMapPin[]; isTruncated: boolean } };
  isFetching: boolean;
  isError: boolean;
  isPlaceholderData?: boolean;
  refetch: () => void;
};
let queryResult: TQuery;
let lastParams: unknown;

vi.mock("@/services/domains/salons/hooks/useQueryMapPins", () => ({
  useQueryMapPins: (params: unknown) => {
    lastParams = params;
    return queryResult;
  },
}));

// The real canvas needs WebGL; the stub exposes what the map would report.
vi.mock("./SearchMap", () => ({
  default: (props: {
    pins: ISalonMapPin[];
    selectedBranchId: string | null;
    onSelectBranch: (id: string) => void;
    onBoundsChange: (b: { north: number; south: number; east: number; west: number }) => void;
    onFail: (r: string) => void;
  }) => (
    <div data-testid="map" data-selected={props.selectedBranchId ?? ""} data-pins={props.pins.length}>
      <button onClick={() => props.onBoundsChange({ north: 35.9, south: 35.5, east: 51.6, west: 51.1 })}>stub-bounds</button>
      <button onClick={() => props.onSelectBranch("branch-2")}>stub-tap-pin-2</button>
      <button onClick={() => props.onFail("style-error")}>stub-fail</button>
    </div>
  ),
}));

// next/dynamic would load the chunk asynchronously; render the (mocked) module directly.
vi.mock("next/dynamic", async () => {
  const mod = await import("./SearchMap");
  return { default: () => mod.default };
});

vi.mock("@/shared/map/mapConfig", () => ({ isMapConfigured: true }));

import SearchMapView from "./SearchMapView";

const baseProps = {
  filters: { genderType: 2 },
  reference: null,
  fitPoints: [] as [number, number][],
  selectedBranchId: null as string | null,
  onSelectBranch: vi.fn(),
  focus: null,
  onBackToList: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  queryResult = {
    data: { data: { items: [pin(1, 2), pin(2, 1), pin(3, 3), pin(4, 0)], isTruncated: false } },
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  };
});

describe("SearchMapView", () => {
  it("asks for pins only after the map reports its bounds, with the shared filters", () => {
    render(<SearchMapView {...baseProps} />);
    expect(lastParams).toBeNull();

    fireEvent.click(screen.getByText("stub-bounds"));
    expect(lastParams).toMatchObject({ genderType: 2, south: 35.5, north: 35.9 });
  });

  it("lists a card per pin with that branch's own audience", () => {
    render(<SearchMapView {...baseProps} />);
    const strip = screen.getByRole("list", { name: "سالن‌های روی نقشه" });
    expect(strip.querySelectorAll("li")).toHaveLength(4);
    expect(strip.textContent).toContain("آقایان");
    expect(strip.textContent).toContain("بانوان و آقایان");
  });

  it("selecting a card selects that branch; tapping a pin selects the same branch's card", () => {
    const onSelectBranch = vi.fn();
    const { rerender } = render(<SearchMapView {...baseProps} onSelectBranch={onSelectBranch} />);

    fireEvent.click(screen.getByText("سالن 3"));
    expect(onSelectBranch).toHaveBeenLastCalledWith(expect.objectContaining({ branchPublicId: "branch-3" }));

    fireEvent.click(screen.getByText("stub-tap-pin-2"));
    expect(onSelectBranch).toHaveBeenLastCalledWith(expect.objectContaining({ branchPublicId: "branch-2", name: "سالن 2" }));

    rerender(<SearchMapView {...baseProps} selectedBranchId="branch-2" />);
    expect(screen.getByTestId("map").getAttribute("data-selected")).toBe("branch-2");
    const selectedCard = screen.getAllByRole("button", { pressed: true });
    expect(selectedCard).toHaveLength(1);
    expect(selectedCard[0].textContent).toContain("سالن 2");
  });

  it("explains a truncated result and an empty box", () => {
    queryResult = { ...queryResult, data: { data: { items: [pin(1, 2)], isTruncated: true } } };
    const { rerender } = render(<SearchMapView {...baseProps} />);
    fireEvent.click(screen.getByText("stub-bounds"));
    expect(screen.getByText(/بزرگ‌نمایی کنید/)).toBeTruthy();

    queryResult = { ...queryResult, data: { data: { items: [], isTruncated: false } } };
    rerender(<SearchMapView {...baseProps} />);
    expect(screen.getByText(/در این محدوده سالنی نیست/)).toBeTruthy();
  });

  it("never shows pins from the previous filter while the new filter loads, but keeps them while panning", () => {
    const { rerender } = render(<SearchMapView {...baseProps} />);
    fireEvent.click(screen.getByText("stub-bounds"));
    expect(screen.getByTestId("map").getAttribute("data-pins")).toBe("4");

    // Filter changed: react-query keeps the old rows as placeholder data until the new ones arrive.
    queryResult = { ...queryResult, isPlaceholderData: true, isFetching: true };
    rerender(<SearchMapView {...baseProps} filters={{ genderType: 1 }} />);
    expect(screen.getByTestId("map").getAttribute("data-pins")).toBe("0");
    expect(screen.queryByRole("list", { name: "سالن‌های روی نقشه" })).toBeNull();

    // New rows arrived.
    queryResult = { ...queryResult, isPlaceholderData: false, isFetching: false, data: { data: { items: [pin(2, 1)], isTruncated: false } } };
    rerender(<SearchMapView {...baseProps} filters={{ genderType: 1 }} />);
    expect(screen.getByTestId("map").getAttribute("data-pins")).toBe("1");

    // Same filters, new box (a pan): the previous pins stay up until the next response, no flicker.
    queryResult = { ...queryResult, isPlaceholderData: true, isFetching: true };
    fireEvent.click(screen.getByText("stub-bounds"));
    rerender(<SearchMapView {...baseProps} filters={{ genderType: 1 }} />);
    expect(screen.getByTestId("map").getAttribute("data-pins")).toBe("1");
  });

  it("lets the user retry when the pin request fails", () => {
    const refetch = vi.fn();
    queryResult = { data: undefined, isFetching: false, isError: true, refetch };
    render(<SearchMapView {...baseProps} />);
    fireEvent.click(screen.getByText("stub-bounds"));

    fireEvent.click(screen.getByText(/دریافت سالن‌ها ناموفق بود/));
    expect(refetch).toHaveBeenCalled();
  });

  it("shows a fallback with a way back to the list (and a retry) when the map cannot load", () => {
    const onBackToList = vi.fn();
    render(<SearchMapView {...baseProps} onBackToList={onBackToList} />);

    fireEvent.click(screen.getByText("stub-fail"));

    expect(screen.getByText(/نقشه بارگذاری نشد/)).toBeTruthy();
    expect(screen.getByText("تلاش دوباره")).toBeTruthy();
    fireEvent.click(screen.getByText("بازگشت به فهرست"));
    expect(onBackToList).toHaveBeenCalled();
  });
});
