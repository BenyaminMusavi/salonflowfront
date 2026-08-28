"use client";

import { useEffect, useState } from "react";

/** SSR-safe: returns `false` until mounted, then tracks the OS-level preference live. */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mediaQueryList.matches);

    const listener = (event: MediaQueryListEvent) => setPrefersReduced(event.matches);
    mediaQueryList.addEventListener("change", listener);

    return () => mediaQueryList.removeEventListener("change", listener);
  }, []);

  return prefersReduced;
}
