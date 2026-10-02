"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { RouteAddress } from "@/shared/data/routeAddress";
import { useSmartBack } from "@/shared/hooks";

/** «حساب من» header — back only; logout is a labelled row with a confirm, not an icon here. */
export default function SettingsHeader() {
  const goBack = useSmartBack(RouteAddress.PROFILE.BASE);

  return (
    <div className="flex items-center gap-3 px-safe-area">
      <button
        type="button"
        onClick={goBack}
        aria-label="بازگشت"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface"
      >
        <ArrowRight size={20} className="text-foreground" />
      </button>
      <h1 className="text-[18px] font-bold text-foreground">حساب من</h1>
    </div>
  );
}
