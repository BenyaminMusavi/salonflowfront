import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AmenityCategory } from "@/services/domains/amenities/types/amenities.type";

const branchServicesCalls: (string | null)[] = [];
let salon: Record<string, unknown>;

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), back: vi.fn(), replace: vi.fn() }) }));
vi.mock("@/services/domains/salons/hooks/useQuerySalonById", () => ({
  useQuerySalonById: () => ({ data: { data: salon }, isLoading: false, isError: false }),
}));
vi.mock("@/services/domains/salons/hooks/useQuerySalonByUsername", () => ({
  useQuerySalonByUsername: () => ({ data: undefined, isLoading: false, isError: false }),
}));
vi.mock("@/services/domains/favorites/hooks/useToggleFavorite", () => ({
  useToggleFavorite: () => ({ isFavorite: false, canToggle: false, isPending: false, toggle: vi.fn() }),
}));
// Each branch has its own priced list: the row shows which branch's prices are on screen.
vi.mock("@/services/domains/salons/hooks/useQueryBranchServices", () => ({
  useQueryBranchServices: (branchPublicId: string | null) => {
    branchServicesCalls.push(branchPublicId);
    return {
      data: {
        data: [{ offeringPublicId: `o-${branchPublicId}`, name: `کوتاهی مو ${branchPublicId}`, durationMinutes: 30, price: branchPublicId === "b2" ? 200000 : 100000 }],
      },
    };
  },
}));
vi.mock("@/shared/components/composites/layout/top-navigation/TopNavigation", () => ({ default: () => null }));
vi.mock("./components/salons-details-hero/SalonsDetailHero", () => ({ default: () => null }));
vi.mock("./components/salon-reviews-section/SalonReviewsSection", () => ({ default: () => null }));
vi.mock("./components/report-salon-sheet/ReportSalonSheet", () => ({ default: () => null }));
vi.mock("./components/salons-details-directions/SalonsDetailDirectionsSheet", () => ({ default: () => null }));
vi.mock("./components/salons-details-sticky-cta/SalonsDetailStickyCta", () => ({ default: () => null }));
vi.mock("./components/salons-details-identity/SalonsDetailIdentity", () => ({ default: () => null }));
vi.mock("./components/salons-details-trust-row/SalonsDetailTrustRow", () => ({ default: () => null }));
vi.mock("./components/salons-details-social-strip/SalonsDetailSocialStrip", () => ({ default: () => null }));

import SalonsDetailView from "./SalonsDetailView";

const amenity = (key: string, title: string) => ({ key, title, category: AmenityCategory.Access });

beforeEach(() => {
  branchServicesCalls.length = 0;
  salon = {
    id: "s1",
    salonId: 1,
    name: "سالن",
    branches: [
      { publicId: "b1", branchId: 1, name: "ونک", isActive: true, amenities: [amenity("parking", "پارکینگ")] },
      { publicId: "b2", branchId: 2, name: "تجریش", isActive: true, amenities: [amenity("free_wifi", "اینترنت رایگان (Wi-Fi)")] },
      { publicId: "b3", branchId: 3, name: "بسته", isActive: false, amenities: [amenity("tv", "تلویزیون")] },
    ],
    services: [],
    workingHours: [],
  };
});

describe("SalonsDetailView — one branch for services, prices and amenities", () => {
  it("starts on the first active branch and switches services, prices and amenities together", () => {
    render(<SalonsDetailView source={{ id: "s1" }} />);

    expect(screen.getAllByRole("tab").map((t) => t.textContent)).toEqual(["ونک", "تجریش"]);
    expect(branchServicesCalls.at(-1)).toBe("b1");
    expect(screen.getByText("کوتاهی مو b1")).toBeTruthy();
    expect(screen.getByText("پارکینگ")).toBeTruthy();

    fireEvent.click(screen.getByRole("tab", { name: "تجریش" }));

    expect(branchServicesCalls.at(-1)).toBe("b2");
    expect(screen.getByText("کوتاهی مو b2")).toBeTruthy();
    expect(screen.getByText("قیمت‌ها در شعبه‌ی تجریش")).toBeTruthy();
    expect(screen.getByText("در شعبه‌ی تجریش")).toBeTruthy();
    expect(screen.getByText("اینترنت رایگان (Wi-Fi)")).toBeTruthy();
    expect(screen.queryByText("پارکینگ")).toBeNull();
    // the booking link carries the same branch
    expect(screen.getByRole("link", { name: /کوتاهی مو b2/ }).getAttribute("href")).toContain("branch=b2");
  });

  it("a single-branch salon has no branch picker", () => {
    salon = { ...salon, branches: [(salon.branches as unknown[])[0]] };
    render(<SalonsDetailView source={{ id: "s1" }} />);

    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.getByText("پارکینگ")).toBeTruthy();
    expect(screen.queryByText(/در شعبه‌ی/)).toBeNull();
  });
});
