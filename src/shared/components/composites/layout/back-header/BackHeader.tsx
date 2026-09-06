"use client";

import { ReactNode } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { useSmartBack } from "@/shared/hooks";

interface BackHeaderProps {
  title: string;
  /** Where to land when there's no in-app history to go back to (deep link, shared link, etc). */
  fallbackHref: string;
  /** Optional control shown on the opposite side of the back button (mirrors ProfileHeader/SettingsHeader). */
  action?: ReactNode;
}

/** Flat back-button header for secondary pages reached outside the bottom-nav tabs (wallet, notifications, subscriptions, …). */
export default function BackHeader({ title, fallbackHref, action }: BackHeaderProps) {
  const goBack = useSmartBack(fallbackHref);

  return (
    <div className="flex items-center justify-between px-safe-area">
      <button
        type="button"
        onClick={goBack}
        aria-label="بازگشت"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface"
      >
        <ArrowRight size={20} className="text-foreground" />
      </button>
      <h1 className="text-[18px] font-bold text-foreground">{title}</h1>
      {action ?? <div className="h-10 w-10" />}
    </div>
  );
}
