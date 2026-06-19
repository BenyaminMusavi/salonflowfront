"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  CalendarBlankIcon,
  CardholderIcon,
  ChartPieSliceIcon,
  CubeTransparentIcon,
  HouseSimpleIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import { cn } from "@/shared/utils/className";
import { RouteAddress } from "@/shared/data/routeAddress";

function BottomNavigation() {
  const pathname = usePathname();

  const getPurePath = (path: string) =>
    path.split("?")[0].replace(/\/$/, "");

  const currentPath = getPurePath(pathname);

  const navItems = [
    { href: RouteAddress.HOME.BASE, icon: HouseSimpleIcon },          // Home
    { href: RouteAddress.SEARCH.BASE, icon: MagnifyingGlassIcon },    // Search
    { href: RouteAddress.RESERVATION.BASE, icon: CalendarBlankIcon }, // Bookings / Reservations
    { href: RouteAddress.PROFILE.BASE, icon: UserCircleIcon },        // Profile
  ];

  const isMainPage = navItems.some(
    (item) => getPurePath(item.href) === currentPath
  );

  if (!isMainPage) return null;

  return (
    <div className="fixed bottom-4 inset-x-0 flex justify-center z-40 px-safe-area">
      <div className="relative flex items-center px-1 w-fit h-[64px] rounded-full border border-foreground/10 bg-foreground/5 backdrop-blur-md">

        {navItems.map(({ href, icon: Icon }) => {
          const isActive = currentPath === getPurePath(href);

          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-1 items-center justify-center h-full"
            >
              {/* ACTIVE BACKGROUND PILL */}
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute flex h-[calc(100%-8px)] aspect-square inset-y-1 rounded-full bg-white/10"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                  }}
                />
              )}

              {/* ICON */}
              <motion.div
                className="relative z-10 w-14 flex justify-center items-center"
                animate={{
                  scale: isActive ? 1.2 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
              >
                <Icon
                  size={24}
                  weight={isActive ? "fill" : "regular"}
                  className={cn(
                    isActive ? "text-primary" : "text-foreground/40"
                  )}
                />
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default BottomNavigation;