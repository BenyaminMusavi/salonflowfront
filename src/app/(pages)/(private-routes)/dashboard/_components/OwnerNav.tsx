"use client";

import Link from "next/link";
import {
  CalendarBlankIcon,
  ChartLineUpIcon,
  GearSixIcon,
  WalletIcon,
} from "@phosphor-icons/react";
import { cn } from "@/shared/utils/className";
import {
  OWNER_NAV_GROUPS,
  isOwnerNavGroupActive,
  type OwnerNavGroup,
} from "./nav";

const ICONS = {
  today: CalendarBlankIcon,
  insight: ChartLineUpIcon,
  ops: GearSixIcon,
  money: WalletIcon,
} as const;

export function OwnerBottomNav({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="منوی پنل سالن‌دار"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur"
    >
      <div className="mx-auto grid max-w-[720px] grid-cols-4 px-safe-area pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1">
        {OWNER_NAV_GROUPS.map((group) => {
          const Icon = ICONS[group.id];
          const active = isOwnerNavGroupActive(group, pathname);
          return (
            <Link
              key={group.id}
              href={group.href}
              className="flex flex-col items-center gap-0.5 py-2"
            >
              <Icon
                size={22}
                weight={active ? "fill" : "regular"}
                className={cn(
                  active ? "text-primary" : "text-foreground-muted"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-semibold",
                  active ? "text-primary" : "text-foreground-muted"
                )}
              >
                {group.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function OwnerSubnav({
  group,
  pathname,
}: {
  group: OwnerNavGroup | null;
  pathname: string;
}) {
  if (!group || group.tabs.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto px-safe-area py-2">
      {group.tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-surface text-foreground-muted"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
