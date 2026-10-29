import { describe, expect, it } from "vitest";
import {
  buildDirectionOptions,
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
