"use client";

import Link from "next/link";
import { BellIcon, GearIcon } from "@phosphor-icons/react";
import { RouteAddress } from "@/shared/data/routeAddress";

export default function ProfileHeader() {
  return (
    <div className="flex items-center justify-between px-safe-area">
      <Link
        href={RouteAddress.PROFILE.SETTINGS}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface"
        aria-label="تنظیمات"
      >
        <GearIcon size={20} className="text-foreground" />
      </Link>
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
