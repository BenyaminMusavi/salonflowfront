"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  CalendarBlankIcon,
  HeartIcon,
  HouseSimpleIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import { cn } from "@/shared/utils/className";
import { RouteAddress } from "@/shared/data/routeAddress";

/**
 * Customer bottom bar: five destinations, each with a short label under the icon. The wallet is
 * not here while top-up is off — it stays reachable from the profile.
 */
const NAV_ITEMS = [
  { href: RouteAddress.HOME.BASE, icon: HouseSimpleIcon, label: "خانه" },
  { href: RouteAddress.SEARCH.BASE, icon: MagnifyingGlassIcon, label: "جستجو" },
  { href: RouteAddress.RESERVATION.BASE, icon: CalendarBlankIcon, label: "نوبت‌ها" },
  { href: RouteAddress.FAVORITES.BASE, icon: HeartIcon, label: "علاقه‌مندی" },
  { href: RouteAddress.PROFILE.BASE, icon: UserCircleIcon, label: "پروفایل" },
];

const getPurePath = (path: string) => path.split("?")[0].replace(/\/$/, "");

function BottomNavigation() {
  const currentPath = getPurePath(usePathname());

  const isMainPage = NAV_ITEMS.some((item) => getPurePath(item.href) === currentPath);
  if (!isMainPage) return null;

  return (
    <nav
      aria-label="منوی اصلی"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-safe-area pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex h-[64px] w-full max-w-[560px] items-stretch rounded-[22px] border border-foreground/10 bg-background/90 px-1 backdrop-blur-md">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = currentPath === getPurePath(href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-x-1 inset-y-1.5 rounded-[16px] bg-surface-brand"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                size={22}
                weight={isActive ? "fill" : "regular"}
                className={cn("relative z-10", isActive ? "text-primary" : "text-foreground-muted")}
              />
              <span
                className={cn(
                  "relative z-10 text-[10px] leading-none",
                  isActive ? "font-bold text-primary" : "text-foreground-muted"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavigation;
