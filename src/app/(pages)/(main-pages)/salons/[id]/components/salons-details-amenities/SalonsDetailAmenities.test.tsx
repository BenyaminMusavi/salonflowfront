import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ISalonBranch } from "@/services/domains/salons/types/booking-browse.type";
import { AmenityCategory } from "@/services/domains/amenities/types/amenities.type";
import SalonsDetailAmenities from "./SalonsDetailAmenities";

const branch = (keys: [string, string][]): ISalonBranch => ({
  publicId: "b1",
  branchId: 1,
  name: "ونک",
  isActive: true,
  amenities: keys.map(([key, title]) => ({ key, title, category: AmenityCategory.Access })),
});

describe("SalonsDetailAmenities", () => {
  it("renders nothing when the branch has no amenities or no branch is selected", () => {
    const { container, rerender } = render(<SalonsDetailAmenities branch={branch([])} />);
    expect(container.innerHTML).toBe("");

    rerender(<SalonsDetailAmenities branch={null} />);
    expect(container.innerHTML).toBe("");
  });

  it("lists only the branch's amenities with their Persian titles", () => {
    render(<SalonsDetailAmenities branch={branch([["parking", "پارکینگ"], ["kids_friendly", "فضای مناسب کودک"]])} />);

    expect(screen.getByRole("heading", { name: "امکانات و رفاه" })).toBeTruthy();
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(["پارکینگ", "فضای مناسب کودک"]);
    expect(screen.queryByText(/در شعبه‌ی/)).toBeNull();
  });

  it("names the branch when the salon has several", () => {
    render(<SalonsDetailAmenities branch={branch([["parking", "پارکینگ"]])} showBranchName />);

    expect(screen.getByText("در شعبه‌ی ونک")).toBeTruthy();
  });
});
