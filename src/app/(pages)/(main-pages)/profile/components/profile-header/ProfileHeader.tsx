"use client";

import { GearIcon, ShareNetworkIcon } from "@phosphor-icons/react";

export default function ProfileHeader() {
  return (
    <div className="flex items-center justify-between px-safe-area">
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface"
      >
        <GearIcon size={20} className="text-foreground" />
      </button>
      <h1 className="text-[18px] font-bold text-foreground">پروفایل</h1>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface"
      >
        <ShareNetworkIcon size={20} className="text-foreground" />
      </button>
    </div>
  );
}
