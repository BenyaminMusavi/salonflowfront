import { describe, expect, it } from "vitest";
import { computeMarquee, MARQUEE_MIN_CYCLE_S, MARQUEE_SPEED_PX_PER_S, sameMarquee } from "./marquee";

describe("computeMarquee — only text that really overflows moves", () => {
  it("a title that fits (or has not been measured) never animates", () => {
    expect(computeMarquee({ contentWidth: 40, frameWidth: 56, rtl: true })).toBeNull();
    expect(computeMarquee({ contentWidth: 56, frameWidth: 56, rtl: true })).toBeNull();
    expect(computeMarquee({ contentWidth: 0, frameWidth: 56, rtl: true })).toBeNull();
    expect(computeMarquee({ contentWidth: 80, frameWidth: 0, rtl: true })).toBeNull();
    expect(computeMarquee({ contentWidth: Number.NaN, frameWidth: 56, rtl: true })).toBeNull();
  });

  it("sub-pixel rounding does not start an animation for a title that fits", () => {
    expect(computeMarquee({ contentWidth: 56.6, frameWidth: 56, rtl: true })).toBeNull();
  });

  it("an overflowing title shifts by the hidden part plus a small margin, towards its reading direction", () => {
    const rtl = computeMarquee({ contentWidth: 100, frameWidth: 56, rtl: true })!;
    const ltr = computeMarquee({ contentWidth: 100, frameWidth: 56, rtl: false })!;

    expect(rtl.shift).toBe(46); // 44 hidden + 2 px margin, text moves right in RTL to show the tail on the left
    expect(ltr.shift).toBe(-46);
  });

  it("glides slowly: never faster than the reading speed, and a longer title takes a longer cycle", () => {
    const medium = computeMarquee({ contentWidth: 70, frameWidth: 56, rtl: true })!;
    const long = computeMarquee({ contentWidth: 160, frameWidth: 56, rtl: true })!;
    const veryLong = computeMarquee({ contentWidth: 400, frameWidth: 56, rtl: true })!;

    expect(medium.durationSec).toBeGreaterThanOrEqual(MARQUEE_MIN_CYCLE_S);
    expect(long.durationSec).toBeGreaterThan(medium.durationSec);
    expect(veryLong.durationSec).toBeGreaterThan(long.durationSec);
    // the glide is 40 % of the cycle: distance / (0.4 × cycle) must not exceed the speed cap
    for (const m of [medium, long, veryLong]) {
      expect(Math.abs(m.shift) / (0.4 * m.durationSec)).toBeLessThanOrEqual(MARQUEE_SPEED_PX_PER_S + 0.5);
    }
  });

  it("compares two results by value (so a re-measure with the same numbers causes no re-render)", () => {
    expect(sameMarquee(null, null)).toBe(true);
    expect(sameMarquee({ shift: 10, durationSec: 7 }, { shift: 10, durationSec: 7 })).toBe(true);
    expect(sameMarquee({ shift: 10, durationSec: 7 }, { shift: 11, durationSec: 7 })).toBe(false);
    expect(sameMarquee(null, { shift: 10, durationSec: 7 })).toBe(false);
  });
});
