import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

const state = vi.hoisted(() => ({ map: false, query: "" }));
const replace = vi.fn();
let lastSalonsParams: Record<string, unknown> | undefined;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(state.query),
}));
vi.mock("next/dynamic", () => ({ default: () => () => <div data-testid="map-view" /> }));
vi.mock("@/shared/map/mapConfig", () => ({
  get isMapConfigured() {
    return state.map;
  },
}));
vi.mock("@/services/domains/salons/hooks/useInfiniteApprovedSalons", () => ({
  useInfiniteApprovedSalons: (params: Record<string, unknown>) => {
    lastSalonsParams = params;
    return { data: { pages: [{ data: { items: [] } }] }, isLoading: false, isError: false, hasNextPage: false, fetchNextPage: vi.fn(), isFetchingNextPage: false, isPlaceholderData: false };
  },
}));
vi.mock("@/services/domains/service-type/hooks/useQueryServiceTypes", () => ({
  useQueryServiceTypes: () => ({ data: { data: [{ id: "cat-1", name: "کوتاهی مو" }] }, isLoading: false }),
}));
vi.mock("./components/search-header/SearchHeader", () => ({ default: () => <div /> }));
vi.mock("./components/search-hero/SearchHero", () => ({ default: () => <div /> }));
vi.mock("./components/search-card-grid/SearchCardGrid", () => ({ default: () => <div data-testid="grid" /> }));
vi.mock("./components/search-filter-sheet/SearchFilterSheet", () => ({ default: () => null, EMPTY_SEARCH_FILTERS: {} }));

import SearchView from "./SearchView";

const lastUrl = () => String(replace.mock.calls.at(-1)?.[0] ?? "");

beforeEach(() => {
  vi.clearAllMocks();
  state.map = false;
  state.query = "";
  lastSalonsParams = undefined;
});

describe("SearchView — view and sort controls", () => {
  it("defaults to the «پیشنهادی» order and sends no sort to the API", () => {
    render(<SearchView />);

    expect(screen.getByRole("radio", { name: "پیشنهادی" }).getAttribute("aria-checked")).toBe("true");
    expect(lastSalonsParams?.sort).toBeUndefined();
  });

  it("«جدیدترین» is a real API sort, kept in the URL next to the category and search", () => {
    state.query = "serviceTypePublicId=cat-1&search=%D8%B1%D8%B2";
    render(<SearchView />);

    fireEvent.click(screen.getByRole("radio", { name: "جدیدترین" }));

    expect(lastUrl()).toContain("sort=newest");
    expect(lastUrl()).toContain("serviceTypePublicId=cat-1");
    expect(lastUrl()).toContain("search=");
  });

  it("reads sort=newest from the URL: the control shows it and the API receives it", () => {
    state.query = "sort=newest";
    render(<SearchView />);

    expect(screen.getByRole("radio", { name: "جدیدترین" }).getAttribute("aria-checked")).toBe("true");
    expect(lastSalonsParams?.sort).toBe("newest");
  });

  it("going back to «پیشنهادی» removes the param", () => {
    state.query = "sort=newest&serviceTypePublicId=cat-1";
    render(<SearchView />);

    fireEvent.click(screen.getByRole("radio", { name: "پیشنهادی" }));

    expect(lastUrl()).not.toContain("sort=");
    expect(lastUrl()).toContain("serviceTypePublicId=cat-1");
  });

  it("without a configured map there is no view toggle, only the sort", () => {
    render(<SearchView />);

    expect(screen.queryByRole("tablist", { name: "نمایش نتایج" })).toBeNull();
    expect(screen.getByRole("radiogroup")).toBeTruthy();
  });

  it("switching to the map keeps sort, category and search; the sort (list only) hides but stays in the URL", () => {
    state.map = true;
    state.query = "sort=newest&serviceTypePublicId=cat-1&genderType=2";
    const { rerender } = render(<SearchView />);

    fireEvent.click(screen.getByRole("tab", { name: "نقشه" }));
    const mapUrl = lastUrl();
    expect(mapUrl).toContain("view=map");
    expect(mapUrl).toContain("sort=newest");
    expect(mapUrl).toContain("serviceTypePublicId=cat-1");
    expect(mapUrl).toContain("genderType=2");

    state.query = mapUrl.split("?")[1];
    rerender(<SearchView />);
    expect(screen.getByTestId("map-view")).toBeTruthy();
    expect(screen.queryByRole("radiogroup")).toBeNull();
    expect(screen.queryByTestId("grid")).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "فهرست" }));
    expect(lastUrl()).not.toContain("view=");
    expect(lastUrl()).toContain("sort=newest");
  });
});
