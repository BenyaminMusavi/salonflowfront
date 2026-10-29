import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import SearchSortControl from "./search-sort-control/SearchSortControl";
import SearchViewToggle from "./search-view-toggle/SearchViewToggle";
import SearchCategories from "./search-categories/SearchCategories";

describe("SearchSortControl", () => {
  it("is a radio group whose checked option is the current sort", () => {
    render(<SearchSortControl value="newest" onChange={vi.fn()} />);

    expect(screen.getByRole("radiogroup", { name: "ترتیب نمایش سالن‌ها" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "جدیدترین" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("radio", { name: "پیشنهادی" }).getAttribute("aria-checked")).toBe("false");
  });

  it("reports the picked sort", () => {
    const onChange = vi.fn();
    render(<SearchSortControl value="recommended" onChange={onChange} />);

    fireEvent.click(screen.getByRole("radio", { name: "جدیدترین" }));

    expect(onChange).toHaveBeenCalledWith("newest");
  });
});

describe("SearchViewToggle", () => {
  it("shows which view is active and reports the other", () => {
    const onChange = vi.fn();
    render(<SearchViewToggle value="list" onChange={onChange} />);

    expect(screen.getByRole("tab", { name: "فهرست" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tab", { name: "نقشه" }).getAttribute("aria-selected")).toBe("false");
    fireEvent.click(screen.getByRole("tab", { name: "نقشه" }));
    expect(onChange).toHaveBeenCalledWith("map");
  });
});

describe("SearchCategories", () => {
  const categories = [
    { id: "a", name: "کوتاهی مو" },
    { id: "b", name: "ناخن" },
  ];

  it("marks only the selected category as pressed, and toggles it off on a second tap", () => {
    const onSelect = vi.fn();
    render(<SearchCategories categories={categories} selectedId="a" onSelect={onSelect} />);

    const selected = screen.getByRole("button", { name: /کوتاهی مو/ });
    expect(selected.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: /ناخن/ }).getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(selected);
    expect(onSelect).toHaveBeenCalledWith(null);
    fireEvent.click(screen.getByRole("button", { name: /ناخن/ }));
    expect(onSelect).toHaveBeenLastCalledWith("b");
  });

  // Root cause of the clipped ring: the selection ring is a box-shadow drawn 4px OUTSIDE the 56px circle, and the horizontal
  // scroller (overflow-x:auto ⇒ overflow-y clips too) had no padding, so the ring was cut at its edges. The scroller needs room.
  it("gives the horizontal scroller padding so the selection ring is never clipped", () => {
    render(<SearchCategories categories={categories} selectedId="a" onSelect={vi.fn()} />);

    const scroller = screen.getByRole("button", { name: /کوتاهی مو/ }).parentElement as HTMLElement;
    expect(scroller.className).toContain("overflow-x-auto");
    expect(scroller.className).toMatch(/\bp-2\b/);
    expect(scroller.className).toMatch(/-m-2\b/);

    const circle = screen.getByRole("button", { name: /کوتاهی مو/ }).firstElementChild as HTMLElement;
    expect(circle.className).toContain("ring-2");
    expect(circle.className).toContain("rounded-full");
  });
});
