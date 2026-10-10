"use client"
import React, { ReactNode } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { useSmartBack } from "@/shared/hooks";
import { cn } from "@/shared/utils/className";

interface IProps {
  /** Page title. In the bar it sits next to the back arrow; over a photo it is a small tag. */
  children?: ReactNode;
  /** Where to land when there's no in-app history to go back to (deep link, shared link, etc). */
  fallbackHref: string;
  /**
   * "bar" (default): a solid header that also reserves its own height, so it never covers the
   * page. "overlay": transparent, over a full-bleed photo hero (salon page) — the page itself
   * must start with that hero.
   */
  variant?: "bar" | "overlay";
  /** Extra controls on the left side of the bar (e.g. share). */
  action?: ReactNode;
}

const BAR_HEIGHT = "h-16";

const TopNavigation = ({ children, fallbackHref, variant = "bar", action }: IProps) => {
  const goBack = useSmartBack(fallbackHref);
  const overlay = variant === "overlay";

  const backButton = (
    <button
      type="button"
      onClick={goBack}
      aria-label="بازگشت"
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
        overlay ? "bg-overlay/40 backdrop-blur-xl hover:bg-overlay/60" : "hover:bg-surface-hover"
      )}
    >
      <ArrowRightIcon size={20} className={overlay ? "text-on-media" : "text-foreground"} weight="bold" />
    </button>
  );

  if (overlay) {
    return (
      <div className="fixed inset-x-0 top-0 z-20 flex justify-center bg-transparent">
        <div className="flex w-full max-w-[600px] items-center justify-between px-safe-area py-4">
          {backButton}
          {children ? (
            <span className="rounded-full bg-overlay/60 px-3 py-2 text-xs font-bold text-on-media backdrop-blur-sm">
              {children}
            </span>
          ) : (
            action ?? null
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-20 flex justify-center border-b border-border bg-background/95 backdrop-blur">
        <div className={cn("flex w-full max-w-[600px] items-center gap-2 px-safe-area", BAR_HEIGHT)}>
          {backButton}
          {children ? <h1 className="min-w-0 flex-1 truncate text-base font-bold text-foreground">{children}</h1> : <span className="flex-1" />}
          {action ?? null}
        </div>
      </div>
      {/* Reserves the bar's height so the page starts below it. */}
      <div aria-hidden className={cn("shrink-0", BAR_HEIGHT)} />
    </>
  );
};

export default TopNavigation;
