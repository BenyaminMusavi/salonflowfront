"use client";

import Link from "next/link";
import { BellIcon } from "@phosphor-icons/react";
import { RouteAddress } from "@/shared/data/routeAddress";

export default function ProfileHeader() {
  return (
    <div className="flex items-center justify-between px-safe-area">
      {/* «حساب من» is a row in the list below — no duplicate gear here. */}
      <span className="h-10 w-10" aria-hidden />
      <h1 className="text-[18px] font-bold text-foreground">پروفایل</h1>
      <Link
        href={RouteAddress.NOTIFICATIONS.BASE}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface"
        aria-label="اعلان‌ها"
      >
        <BellIcon size={20} className="text-foreground" />
      </Link>
    </div>
  );
}
