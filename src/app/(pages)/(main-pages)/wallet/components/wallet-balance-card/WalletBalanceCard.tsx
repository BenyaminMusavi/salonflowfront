"use client";

import { TrendUp, TrendUpIcon } from "@phosphor-icons/react";

export default function WalletBalanceCard() {
  return (
    <div className="mx-safe-area overflow-hidden rounded-[24px] bg-gradient-to-br from-primary via-primary-hover to-primary-active p-6">
      <p className="text-[13px] text-primary-foreground/60">موجودی فعلی</p>
      <p className="mt-1 text-[28px] font-bold text-primary-foreground">
        ۴۵۰,۹۳۳ تومان
      </p>
      <div className="mt-4 flex items-center gap-1.5 rounded-full bg-primary-foreground/20 px-3 py-1.5 w-fit">
        <TrendUpIcon size={16} weight="bold" className="text-primary-foreground" />
        <span className="text-[13px] font-semibold text-primary-foreground">+13.25%</span>
      </div>
    </div>
  );
}
