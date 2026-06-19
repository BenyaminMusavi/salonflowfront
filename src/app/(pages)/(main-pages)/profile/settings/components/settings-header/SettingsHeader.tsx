"use client";

import { ArrowRight, SignOut } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

export default function SettingsHeader() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between px-safe-area">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface"
      >
        <ArrowRight size={20} className="text-foreground" />
      </button>
      <h1 className="text-[18px] font-bold text-foreground">تنظیمات</h1>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface"
      >
        <SignOut size={20} className="text-foreground" />
      </button>
    </div>
  );
}
