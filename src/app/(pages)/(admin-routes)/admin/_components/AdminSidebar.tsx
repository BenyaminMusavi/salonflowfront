"use client";

import Link from "next/link";
import { ShieldCheckIcon } from "@phosphor-icons/react";
import { cn } from "@/shared/utils/className";
import { ADMIN_NAV_ITEMS } from "./nav";

export function AdminSidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-l border-border bg-surface md:flex">
      <div className="flex items-center gap-2 border-b border-border px-5 py-5">
        <ShieldCheckIcon size={22} className="text-primary" />
        <span className="text-sm font-bold text-foreground">پنل مدیریت صفا</span>
      </div>

      <nav className="flex flex-col gap-1 p-3">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.href != null && pathname === item.href;

          if (!item.href) {
            return (
              <div
                key={item.id}
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-foreground-disabled"
                title="به‌زودی"
              >
                <Icon size={18} />
                <span className="flex-1 text-[13px] font-medium">{item.label}</span>
                <span className="text-[10px]">به‌زودی</span>
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-foreground-muted hover:bg-background-secondary hover:text-foreground"
              )}
            >
              <Icon size={18} weight={active ? "fill" : "regular"} />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
