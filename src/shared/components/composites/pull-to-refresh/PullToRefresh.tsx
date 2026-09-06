"use client";

import { ReactNode, TouchEvent, useRef, useState } from "react";
import { ArrowClockwiseIcon } from "@phosphor-icons/react";
import { cn } from "@/shared/utils/className";

const THRESHOLD = 70;
const MAX_PULL = 110;

interface PullToRefreshProps {
  /** Called when the user releases past the threshold; awaited before the indicator collapses. */
  onRefresh: () => Promise<unknown> | void;
  children: ReactNode;
  disabled?: boolean;
}

/** Touch-driven pull-to-refresh — only engages when the page is already scrolled to the top. */
export default function PullToRefresh({ onRefresh, children, disabled }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const pulling = useRef(false);

  const handleTouchStart = (e: TouchEvent) => {
    if (disabled || refreshing) return;
    if (window.scrollY > 0) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!pulling.current || startY.current == null) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta <= 0) {
      setPullDistance(0);
      return;
    }
    setPullDistance(Math.min(delta * 0.5, MAX_PULL));
  };

  const handleTouchEnd = async () => {
    if (!pulling.current) return;
    pulling.current = false;
    startY.current = null;

    if (pullDistance >= THRESHOLD) {
      setRefreshing(true);
      setPullDistance(THRESHOLD);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  const progress = Math.min(pullDistance / THRESHOLD, 1);

  return (
    <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <div
        className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out"
        style={{ height: pullDistance }}
      >
        <ArrowClockwiseIcon
          size={20}
          className={cn("text-primary", refreshing && "animate-spin")}
          style={
            refreshing
              ? undefined
              : { transform: `rotate(${progress * 180}deg)`, opacity: progress }
          }
        />
      </div>
      {children}
    </div>
  );
}
