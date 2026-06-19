"use client";

import { CaretLeft, UsersThree, Gear } from "@phosphor-icons/react";

const items = [
  { label: "ذخیره گروه‌ها", icon: UsersThree },
  { label: "تنظیمات", icon: Gear },
];

export default function ProfileMenuList() {
  return (
    <div className="flex flex-col gap-2 px-safe-area">
      {items.map(({ label, icon: Icon }) => (
        <button
          key={label}
          type="button"
          className="flex items-center gap-3 rounded-[16px] bg-surface p-4 text-right"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background-tertiary">
            <Icon size={20} className="text-primary" />
          </div>
          <span className="flex-1 text-[14px] font-bold text-foreground">
            {label}
          </span>
          <CaretLeft size={18} className="text-foreground-muted" />
        </button>
      ))}
    </div>
  );
}
