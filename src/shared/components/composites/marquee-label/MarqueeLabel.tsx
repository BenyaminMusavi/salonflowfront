"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { cn } from "@/shared/utils/className";
import { computeMarquee, isRtl, sameMarquee, type IMarquee } from "@/shared/utils/marquee";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const hasMatchMedia = () => typeof window !== "undefined" && typeof window.matchMedia === "function";

function subscribeReducedMotion(onChange: () => void) {
  if (!hasMatchMedia()) return () => {};
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => (hasMatchMedia() ? window.matchMedia(REDUCED_MOTION_QUERY).matches : false),
    () => false
  );
}

interface MarqueeLabelProps {
  text: string;
  /** Box styling: width, font, colour, alignment. The width is the visible width the title must fit into. */
  className?: string;
}

/**
 * A one-line title that keeps its box. When it fits, nothing moves and the whole title shows. Only when the text is really wider
 * than the box (measured: content `scrollWidth` > box `clientWidth`) it glides slowly along its reading direction, pausing at
 * both ends (CSS `label-marquee` in globals.css, which also pauses on hover / focus / press). With «reduce motion» there is no
 * animation at all: the title is truncated with «…» and its full text is in the tooltip.
 */
export default function MarqueeLabel({ text, className }: MarqueeLabelProps) {
  const frameRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [marquee, setMarquee] = useState<IMarquee | null>(null);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const frame = frameRef.current;
    const content = contentRef.current;
    if (reduceMotion || !frame || !content) {
      setMarquee(null);
      return;
    }

    const measure = () => {
      const next = computeMarquee({ contentWidth: content.scrollWidth, frameWidth: frame.clientWidth, rtl: isRtl(frame) });
      setMarquee((prev) => (sameMarquee(prev, next) ? prev : next));
    };

    measure();
    // The webfont changes the text width after first paint; the box can also change with the layout.
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(frame);
    observer?.observe(content);
    let cancelled = false;
    void document.fonts?.ready.then(() => {
      if (!cancelled) measure();
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [text, reduceMotion]);

  if (reduceMotion) {
    return (
      <span className={cn("block truncate", className)} title={text}>
        {text}
      </span>
    );
  }

  const style = marquee
    ? ({ "--marquee-shift": `${marquee.shift}px`, "--marquee-duration": `${marquee.durationSec}s` } as CSSProperties)
    : undefined;

  return (
    <span
      ref={frameRef}
      data-marquee-frame
      data-marquee={marquee ? "true" : "false"}
      title={marquee ? text : undefined}
      className={cn("block overflow-hidden whitespace-nowrap", className)}
    >
      <span ref={contentRef} data-marquee-content className={cn("inline-block", marquee && "label-marquee")} style={style}>
        {text}
      </span>
    </span>
  );
}
