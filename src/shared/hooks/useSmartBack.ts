"use client";

import { useRouter } from "next/navigation";

/**
 * Returns a back handler that uses real browser history when the current tab
 * actually has an in-app previous entry (`window.history.length > 1`), and
 * otherwise falls back to `fallbackHref` — covers deep links, shared links,
 * and pages opened as the first screen in a tab, where `router.back()` would
 * either do nothing or leave the app entirely.
 */
export function useSmartBack(fallbackHref: string) {
  const router = useRouter();

  return () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };
}
