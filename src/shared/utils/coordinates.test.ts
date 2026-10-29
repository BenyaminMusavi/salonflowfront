import { describe, expect, it } from "vitest";
import { coordinatesPairError, parseCoordinateInput, roundCoordinate } from "./coordinates";

describe("coordinatesPairError", () => {
  it("accepts both values, or none", () => {
    expect(coordinatesPairError(35.7219, 51.3347)).toBeNull();
    expect(coordinatesPairError(null, null)).toBeNull();
    expect(coordinatesPairError(undefined, undefined)).toBeNull();
    expect(coordinatesPairError(0, 0)).toBeNull();
  });

  it("rejects only one of the two (backend: branch_coordinates_incomplete)", () => {
    expect(coordinatesPairError(35.7, null)).not.toBeNull();
    expect(coordinatesPairError(null, 51.3)).not.toBeNull();
  });

  it("rejects non-finite and out-of-range values (backend: branch_coordinates_invalid)", () => {
    expect(coordinatesPairError(Number.NaN, 51)).not.toBeNull();
    expect(coordinatesPairError(35, Number.POSITIVE_INFINITY)).not.toBeNull();
    expect(coordinatesPairError(91, 51)).not.toBeNull();
    expect(coordinatesPairError(35, -181)).not.toBeNull();
  });
});

describe("parseCoordinateInput / roundCoordinate", () => {
  it("parses a number, an empty field and the Persian decimal point", () => {
    expect(parseCoordinateInput("35.7219")).toBe(35.7219);
    expect(parseCoordinateInput("35٫7219")).toBe(35.7219);
    expect(parseCoordinateInput("  ")).toBeNull();
    expect(Number.isNaN(parseCoordinateInput("abc"))).toBe(true);
  });

  it("treats a comma or the Arabic comma as the decimal point", () => {
    expect(parseCoordinateInput("35,7219")).toBe(35.7219);
    expect(parseCoordinateInput("35،7219")).toBe(35.7219);
  });

  it("rounds to 6 decimals", () => {
    expect(roundCoordinate(35.72190012345)).toBe(35.7219);
  });
});
