import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AmenityCategory, type IAmenity } from "@/services/domains/amenities/types/amenities.type";

let query: { data?: { data: IAmenity[] }; isLoading: boolean; isError: boolean };

vi.mock("@/services/domains/amenities/hooks/useQueryAmenities", () => ({
  useQueryAmenities: () => query,
}));

import AmenityPicker from "./AmenityPicker";

const catalog: IAmenity[] = [
  { key: "water_cooler", title: "آبسردکن", category: AmenityCategory.Refreshments, showOnCard: false },
  { key: "free_wifi", title: "اینترنت رایگان (Wi-Fi)", category: AmenityCategory.Comfort, showOnCard: false },
  { key: "parking", title: "پارکینگ", category: AmenityCategory.Access, showOnCard: true },
];

beforeEach(() => {
  query = { data: { data: catalog }, isLoading: false, isError: false };
});

describe("AmenityPicker", () => {
  it("groups the catalog by category and marks the selected amenities as checked", () => {
    render(<AmenityPicker value={["parking"]} onChange={() => {}} />);

    expect(screen.getByRole("group", { name: "امکانات پذیرایی" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "امکانات رفاهی" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "امکانات و دسترسی" })).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: "پارکینگ" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("checkbox", { name: "آبسردکن" }).getAttribute("aria-checked")).toBe("false");
  });

  it("adds an unchecked amenity and removes a checked one", () => {
    const onChange = vi.fn();
    render(<AmenityPicker value={["parking"]} onChange={onChange} />);

    fireEvent.click(screen.getByRole("checkbox", { name: "آبسردکن" }));
    expect(onChange).toHaveBeenLastCalledWith(["parking", "water_cooler"]);

    fireEvent.click(screen.getByRole("checkbox", { name: "پارکینگ" }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("shows loading and error states instead of an empty form", () => {
    query = { isLoading: true, isError: false };
    const { rerender } = render(<AmenityPicker value={[]} onChange={() => {}} />);
    expect(screen.getByText(/در حال بارگذاری امکانات/)).toBeTruthy();

    query = { isLoading: false, isError: true };
    rerender(<AmenityPicker value={[]} onChange={() => {}} />);
    expect(screen.getByText(/دریافت فهرست امکانات ناموفق بود/)).toBeTruthy();
  });
});
