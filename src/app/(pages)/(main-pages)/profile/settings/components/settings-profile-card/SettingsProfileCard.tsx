"use client";

import { PencilSimple } from "@phosphor-icons/react";

export default function SettingsProfileCard() {
  return (
    <div className="mx-safe-area flex items-center gap-3 rounded-[16px] bg-surface p-4">
      <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-border-strong to-background-elevated">
        <span className="text-[18px] font-bold text-foreground">O</span>
      </div>

      <div className="flex-1">
        <h3 className="text-[14px] font-bold text-foreground">Orville Black</h3>
        <p className="text-[12px] text-foreground-muted">
          jacquelyn_fitzgerald@icloud.com
        </p>
        <p className="text-[12px] text-foreground-muted">+1(555) 123-4567</p>
      </div>

      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-background-tertiary"
      >
        <PencilSimple size={16} className="text-primary" />
      </button>
    </div>
  );
}
