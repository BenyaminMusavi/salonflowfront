"use client";

import Link from "next/link";
import {
  CalendarBlankIcon,
  PlusIcon,
  StorefrontIcon,
  UserCircleIcon,
  UsersThreeIcon,
  WalletIcon,
  type Icon,
} from "@phosphor-icons/react";
import { cn } from "@/shared/utils/className";
import {
  getPanelNav,
  isPanelNavItemActive,
  isPanelPathActive,
  type PanelNavId,
  type PanelNavItem,
} from "./nav";
import { useQuickBookStore } from "./quickBookStore";

const ICONS: Record<PanelNavId, Icon> = {
  appointments: CalendarBlankIcon,
  customers: UsersThreeIcon,
  book: PlusIcon,
  money: WalletIcon,
  salon: StorefrontIcon,
  me: UserCircleIcon,
};

/** Mobile/tablet bottom bar; «＋» in the middle opens the quick-book drawer from any page. */
export function PanelBottomNav({
  pathname,
  isStaff,
}: {
  pathname: string;
  isStaff: boolean;
}) {
  const items = getPanelNav(isStaff);
  const openQuickBook = useQuickBookStore((s) => s.openQuickBook);

  return (
    <nav
      aria-label="منوی پنل سالن"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden"
    >
      <div
        className="mx-auto grid px-safe-area pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1"
        style={{ maxWidth: 720, gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const Icon = ICONS[item.id];
          if (!item.href) {
            return (
              <div key={item.id} className="flex justify-center">
                <button
                  type="button"
                  onClick={() => openQuickBook()}
                  aria-label={item.label}
                  className="-mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
                >
                  <Icon size={26} weight="bold" />
                </button>
              </div>
            );
          }
          const active = isPanelNavItemActive(item, pathname);
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="flex flex-col items-center gap-0.5 py-2"
            >
              <Icon
                size={22}
                weight={active ? "fill" : "regular"}
                className={active ? "text-primary" : "text-foreground-muted"}
              />
              <span
                className={cn(
                  "text-[11px] font-semibold",
                  active ? "text-primary" : "text-foreground-muted"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Desktop sidebar (lg+): same items as the bottom bar, with «نوبت جدید» as a full button. */
export function PanelSideNav({
  pathname,
  isStaff,
}: {
  pathname: string;
  isStaff: boolean;
}) {
  const items = getPanelNav(isStaff);
  const openQuickBook = useQuickBookStore((s) => s.openQuickBook);

  return (
    <nav
      aria-label="منوی پنل سالن"
      className="sticky top-[65px] hidden h-[calc(100vh-65px)] w-56 shrink-0 flex-col gap-1 border-l border-border px-3 py-4 lg:flex"
    >
      <button
        type="button"
        onClick={() => openQuickBook()}
        className="mb-3 flex h-11 items-center justify-center gap-2 rounded-[12px] bg-primary text-sm font-semibold text-primary-foreground"
      >
        <PlusIcon size={18} weight="bold" />
        نوبت جدید
      </button>
      {items
        .filter((item) => item.href)
        .map((item) => {
          const Icon = ICONS[item.id];
          const active = isPanelNavItemActive(item, pathname);
          return (
            <Link
              key={item.id}
              href={item.href!}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-11 items-center gap-3 rounded-[12px] px-3 text-sm font-semibold transition-colors",
                active
                  ? "bg-surface-brand text-content-brand"
                  : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
              )}
            >
              <Icon size={20} weight={active ? "fill" : "regular"} />
              {item.label}
            </Link>
          );
        })}
    </nav>
  );
}

/** In-section tabs (e.g. «مالی»), shown under the header. */
export function PanelSubnav({
  item,
  pathname,
}: {
  item: PanelNavItem | null;
  pathname: string;
}) {
  const tabs = item?.tabs ?? [];
  if (tabs.length === 0) return null;

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-safe-area py-2">
      {tabs.map((tab) => {
        const active = isPanelPathActive(tab.href, pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-surface-hover text-foreground-muted"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
