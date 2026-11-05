import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

const state = vi.hoisted(() => ({ query: "", list: undefined as Record<string, unknown> | undefined, map: undefined as Record<string, unknown> | undefined }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(state.query),
}));
vi.mock("next/dynamic", () => ({
  default: () => (props: { filters: Record<string, unknown> }) => {
    state.map = props.filters;
    return <div data-testid="map-view" />;
  },
}));
vi.mock("@/shared/map/mapConfig", () => ({ isMapConfigured: true }));
vi.mock("@/services/domains/locations/utils/userLocation", async (orig) => ({
  ...(await orig<typeof import("@/services/domains/locations/utils/userLocation")>()),
  isLocationFeatureEnabled: true,
}));
vi.mock("@/services/domains/salons/hooks/useInfiniteApprovedSalons", () => ({
  useInfiniteApprovedSalons: (params: Record<string, unknown>) => {
    state.list = params;
    return { data: { pages: [{ data: { items: [] } }] }, isLoading: false, isError: false, hasNextPage: false, fetchNextPage: vi.fn(), isFetchingNextPage: false, isPlaceholderData: false };
  },
}));
vi.mock("@/services/domains/service-type/hooks/useQueryServiceTypes", () => ({ useQueryServiceTypes: () => ({ data: { data: [] }, isLoading: false }) }));
vi.mock("@/shared/components/composites/user-location/LocationChip", () => ({ default: () => <div data-testid="location-chip" /> }));
vi.mock("./components/search-header/SearchHeader", () => ({ default: () => <div /> }));
vi.mock("./components/search-hero/SearchHero", () => ({ default: () => <div /> }));
vi.mock("./components/search-card-grid/SearchCardGrid", () => ({ default: () => <div data-testid="grid" /> }));
vi.mock("./components/search-filter-sheet/SearchFilterSheet", () => ({ default: () => null, EMPTY_SEARCH_FILTERS: {} }));

import SearchView from "./SearchView";
import { useUserLocationStore } from "@/services/domains/locations/store/useUserLocationStore";

const tehran = { publicId: "c-teh", name: "تهران", provincePublicId: "p", provinceName: "تهران", latitude: 35.69, longitude: 51.39, hasDistricts: true };

beforeEach(() => {
  state.query = "";
  state.list = undefined;
  state.map = undefined;
  localStorage.clear();
  useUserLocationStore.setState({ manual: null, gps: null, mode: null });
});

describe("SearchView — shared user location", () => {
  it("a manual city/district filters the list and the map the same way, with no position", () => {
    useUserLocationStore.getState().setManual(tehran, { publicId: "d-1", name: "نارمک", latitude: 35.73, longitude: 51.5 });
    state.query = "view=map";
    render(<SearchView />);

    expect(state.list).toMatchObject({ cityPublicId: "c-teh", districtPublicId: "d-1" });
    expect(state.list?.lat).toBeUndefined();
    expect(state.map).toMatchObject({ cityPublicId: "c-teh", districtPublicId: "d-1" });
  });

  it("the device position (this visit only) sends a rounded point and no city; the radius from the URL applies", () => {
    useUserLocationStore.getState().setManual(tehran, null);
    useUserLocationStore.getState().setGps({ lat: 35.712345, lng: 51.398765, at: 1 });
    state.query = "radiusKm=20";
    render(<SearchView />);

    expect(state.list).toMatchObject({ lat: 35.712, lng: 51.399, radiusKm: 20 });
    expect(state.list?.cityPublicId).toBeUndefined();
  });

  it("shows the location chip", () => {
    const { getByTestId } = render(<SearchView />);
    expect(getByTestId("location-chip")).toBeTruthy();
  });
});
