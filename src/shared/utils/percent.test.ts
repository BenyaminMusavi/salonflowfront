import { describe, expect, it } from "vitest";
import { formatPercent } from "./percent";

describe("formatPercent", () => {
  it("puts an RTL mark between the digits and the sign", () => {
    expect(formatPercent(50)).toBe("50‏٪");
    expect(formatPercent("12.5")).toBe("12.5‏٪");
  });
});
