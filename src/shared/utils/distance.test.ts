import { describe, expect, it } from "vitest";
import { formatDistanceKm } from "./distance";

describe("formatDistanceKm", () => {
  it("shows metres in 50 m steps under one kilometre", () => {
    expect(formatDistanceKm(0.8)).toBe("800 متر");
    expect(formatDistanceKm(0.34)).toBe("350 متر");
    expect(formatDistanceKm(0.01)).toBe("50 متر");
  });

  it("rolls 975 m+ up to 1 km instead of showing 1000 m", () => {
    expect(formatDistanceKm(0.99)).toBe("1 کیلومتر");
  });

  it("shows one decimal under ten kilometres", () => {
    expect(formatDistanceKm(1)).toBe("1.0 کیلومتر");
    expect(formatDistanceKm(2.44)).toBe("2.4 کیلومتر");
  });

  it("rounds to whole kilometres from ten", () => {
    expect(formatDistanceKm(12.6)).toBe("13 کیلومتر");
  });

  it("returns an empty string for missing or invalid values", () => {
    expect(formatDistanceKm(null)).toBe("");
    expect(formatDistanceKm(undefined)).toBe("");
    expect(formatDistanceKm(Number.NaN)).toBe("");
    expect(formatDistanceKm(-1)).toBe("");
  });
});
