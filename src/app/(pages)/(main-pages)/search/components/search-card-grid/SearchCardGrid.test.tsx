import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import SearchCardGrid from "./SearchCardGrid";

describe("SearchCardGrid empty states", () => {
  it("says nothing was found nearby when a radius is active", () => {
    render(<SearchCardGrid salons={[]} withinRadius />);
    expect(screen.getByText(/در این شعاع سالنی پیدا نشد/)).toBeTruthy();
  });

  it("keeps the generic message when no radius is set", () => {
    render(<SearchCardGrid salons={[]} />);
    expect(screen.getByText("سالنی با این فیلترها یافت نشد")).toBeTruthy();
  });

  it("shows the list error instead of an empty message", () => {
    render(<SearchCardGrid salons={[]} isError />);
    expect(screen.getByText("خطا در دریافت لیست سالن‌ها")).toBeTruthy();
  });
});
