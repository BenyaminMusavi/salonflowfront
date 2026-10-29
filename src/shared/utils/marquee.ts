/**
 * Marquee for a one-line label that does not fit its box. Only text that is REALLY wider than the box animates (detected by
 * measuring, see `MarqueeLabel`); a title that fits stays still and complete.
 *
 * The animation (`label-marquee` in globals.css) is one slow cycle: rest at the start → glide to the end → rest at the end →
 * glide back. The glide covers {@link MARQUEE_SCROLL_SHARE} of the cycle and the rest is pauses, so the cycle length follows
 * the distance: a longer title scrolls for longer, at the same slow speed.
 */
export const MARQUEE_SPEED_PX_PER_S = 24;
/** The glide takes this share of one cycle (the keyframes in globals.css: 25 % → 65 %). */
export const MARQUEE_SCROLL_SHARE = 0.4;
export const MARQUEE_MIN_CYCLE_S = 7;
/** Sub-pixel rounding must not start an animation for a title that fits. */
export const MARQUEE_TOLERANCE_PX = 1;
/** A little extra so the last glyph is not touching the edge when the end is shown. */
const END_PADDING_PX = 2;

export interface IMarquee {
  /** translateX at the end of the glide: positive in RTL (text moves right, revealing the tail on the left), negative in LTR. */
  shift: number;
  /** One full cycle, seconds. */
  durationSec: number;
}

export function computeMarquee(input: { contentWidth: number; frameWidth: number; rtl: boolean }): IMarquee | null {
  const { contentWidth, frameWidth, rtl } = input;
  if (!(frameWidth > 0) || !(contentWidth > 0)) return null;

  const overflow = contentWidth - frameWidth;
  if (overflow <= MARQUEE_TOLERANCE_PX) return null;

  const distance = Math.ceil(overflow) + END_PADDING_PX;
  const cycle = Math.max(MARQUEE_MIN_CYCLE_S, distance / MARQUEE_SPEED_PX_PER_S / MARQUEE_SCROLL_SHARE);
  return { shift: rtl ? distance : -distance, durationSec: Math.round(cycle * 10) / 10 };
}

export function sameMarquee(a: IMarquee | null, b: IMarquee | null): boolean {
  if (a === b) return true;
  return !!a && !!b && a.shift === b.shift && a.durationSec === b.durationSec;
}

/** Text direction of an element, also when the environment (jsdom) does not resolve `direction`. */
export function isRtl(el: Element): boolean {
  const computed = typeof getComputedStyle === "function" ? getComputedStyle(el).direction : "";
  if (computed) return computed === "rtl";
  return (el.closest("[dir]")?.getAttribute("dir") ?? document.documentElement.dir) === "rtl";
}
