"use client";

import Link from "next/link";
import { cn } from "@/shared/utils/className";
import { ADMIN_NAV_ITEMS } from "./nav";

export function AdminMobileNav({ pathname }: { pathname: string }) {
  return (
    <nav className="flex gap-2 overflow-x-auto border-b border-border bg-surface px-3 py-2 md:hidden">
      {ADMIN_NAV_ITEMS.map((item) => {
        const active = item.href != null && pathname === item.href;

        if (!item.href) {
          return (
            <span
              key={item.id}
              className="shrink-0 whitespace-nowrap rounded-full bg-background-secondary px-3 py-1.5 text-[11px] font-semibold text-foreground-disabled"
            >
              {item.label}
            </span>
          );
        }

        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-background-secondary text-foreground-muted"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
