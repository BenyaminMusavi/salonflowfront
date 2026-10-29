import { describe, expect, it } from "vitest";
import {
  buildDirectionOptions,
  formatBranchLocation,
  pickAddressBranch,
  googleMapsDirectionsUrl,
  hasValidCoordinates,
} from "./directions";

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)";
const ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 8)";
const DESKTOP = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";

describe("hasValidCoordinates", () => {
  it("accepts a real pair and rejects missing, partial, NaN and out-of-range values", () => {
    expect(hasValidCoordinates(35.7, 51.3)).toBe(true);
    expect(hasValidCoordinates(null, null)).toBe(false);
    expect(hasValidCoordinates(35.7, null)).toBe(false);
    expect(hasValidCoordinates(Number.NaN, 51.3)).toBe(false);
    expect(hasValidCoordinates(95, 51.3)).toBe(false);
    expect(hasValidCoordinates(35.7, 200)).toBe(false);
  });
});

describe("buildDirectionOptions", () => {
  const target = { latitude: 35.7219, longitude: 51.3347, label: "سالن رز", address: "تهران، ونک" };

  it("points every option at the branch's real coordinates", () => {
    const options = buildDirectionOptions(target, DESKTOP);
    expect(options).toHaveLength(1);
    expect(options[0].href).toBe(googleMapsDirectionsUrl(35.7219, 51.3347));
  });

  it("adds Apple Maps on Apple devices and the geo: link on Android", () => {
    expect(buildDirectionOptions(target, IPHONE).map((o) => o.id)).toEqual(["google", "apple"]);
    const android = buildDirectionOptions(target, ANDROID);
    expect(android.map((o) => o.id)).toEqual(["google", "device"]);
    expect(android[1].href.startsWith("geo:35.7219,51.3347")).toBe(true);
  });

  it("falls back to an address search — never to invented coordinates — when none are stored", () => {
    const options = buildDirectionOptions({ label: "سالن", address: "تهران، ونک" }, ANDROID);
    expect(options).toHaveLength(1);
    expect(options[0].href).toContain("/maps/search/");
    expect(options[0].href).not.toContain("destination=");
  });

  it("returns nothing without coordinates and without an address", () => {
    expect(buildDirectionOptions({ label: "سالن", address: "  " }, DESKTOP)).toEqual([]);
  });
});

describe("pickAddressBranch / formatBranchLocation (address comes from the branches, the salon-level fields do not exist)", () => {
  const withCoords = { city: "تهران", address: "ونک، پلاک ۱", latitude: 35.7, longitude: 51.3 };
  const noCoords = { city: "کرج", address: "گوهردشت", latitude: null, longitude: null };

  it("prefers a branch with real coordinates, then one with an address", () => {
    expect(pickAddressBranch([noCoords, withCoords])).toBe(withCoords);
    expect(pickAddressBranch([{ city: "قم" }, noCoords])).toBe(noCoords);
    expect(pickAddressBranch([{ city: "قم" }])).toEqual({ city: "قم" });
  });

  it("returns nothing when there are no branches", () => {
    expect(pickAddressBranch(undefined)).toBeUndefined();
    expect(pickAddressBranch([])).toBeUndefined();
    expect(formatBranchLocation(undefined)).toBeNull();
  });

  it("joins city and address, without repeating a city the address already contains", () => {
    expect(formatBranchLocation({ city: "تهران", address: "ونک، پلاک ۱" })).toBe("تهران، ونک، پلاک ۱");
    expect(formatBranchLocation({ city: "تهران", address: "تهران، ونک" })).toBe("تهران، ونک");
    expect(formatBranchLocation({ city: "تهران", address: null })).toBe("تهران");
    expect(formatBranchLocation({ city: " ", address: "  " })).toBeNull();
  });
});
