"use client";

import {
  DotsNineIcon,
  ArrowLineUpRightIcon,
  ShoppingCartIcon,
} from "@phosphor-icons/react";
import { PlusIcon } from "@phosphor-icons/react/ssr";

const actions = [
  { label: "افزایش", icon: PlusIcon, color: "text-success" },
  { label: "برداشت", icon: ArrowLineUpRightIcon, color: "text-info" },
  { label: "خرید", icon: ShoppingCartIcon, color: "text-warning" },
  { label: "بیشتر", icon: DotsNineIcon, color: "text-error" },
];

export default function WalletQuickActions() {
  return (
    <div className="flex justify-around px-safe-area">
      {actions.map(({ label, icon: Icon, color }) => (
        <div key={label} className="flex flex-col items-center gap-2">
          <button
            type="button"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-background-secondary"
          >
            <Icon size={22} className={color} weight="bold" />
          </button>
          <span className="text-[12px] text-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}
