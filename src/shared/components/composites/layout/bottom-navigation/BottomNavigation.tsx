"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  CardholderIcon,
  ChartPieSliceIcon,
  CubeTransparentIcon,
  HouseSimpleIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { cn } from "@/shared/utils/className";
import { useCurrentBusinessStore } from "@/services/business/useCurrentBusinessStore";
import { RouteAddress } from "@/shared/data/routeAddress";

function BottomNavigation() {
  const pathname = usePathname();
  const { businessId } = useCurrentBusinessStore();
  if (businessId === null || businessId === undefined) return null;

  const getPurePath = (path: string) => path.split("?")[0].replace(/\/$/, "");

  const navItems = [
    {
      label: "خانه",
      href: RouteAddress.HOME.BASE,
      icon: HouseSimpleIcon,
    },
    {
      label: "مالی",
      href: RouteAddress.FINANCE.BASE,
      icon: CardholderIcon,
    },
    { label: "", href: "" },
    {
      label: "انبار",
      href: RouteAddress.INVENTORY.BASE,
      icon: CubeTransparentIcon,
    },
    {
      label: "گزارشات",
      href: RouteAddress.REPORTS.BASE,
      icon: ChartPieSliceIcon,
    },
  ];

  const currentPath = getPurePath(pathname);

  const isMainPage = navItems.some(({ href }) => {
    if (!href) return false;

    const targetPath = getPurePath(href);

    console.log({
      currentPath,
      targetPath,
    });

    return currentPath === targetPath;
  });

  if (!isMainPage) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 px-safe-area flex justify-center bg-surface-white">
      <div className="relative flex w-full max-w-[600px] h-[64px] items-center">
        {navItems.map(({ label, href, icon: Icon }) => {
          const dashboardHref = RouteAddress.HOME.BASE;
          const isActive =
            href === dashboardHref
              ? pathname === href
              : pathname.startsWith(href);

          return (
            <div
              key={href.toString()}
              className="relative flex justify-center items-center w-full h-full"
            >
              {isActive && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute top-0 w-9 h-[3px] rounded-b-full bg-content-bold will-change-transform"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              {href ? (
                <Link
                  href={href}
                  className="flex flex-col gap-y-1 items-center justify-center w-full h-full"
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1.15 : 1,
                      y: isActive ? -2 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {Icon && (
                      <Icon
                        size={24}
                        weight={isActive ? "fill" : "regular"}
                        className={cn(
                          isActive
                            ? "text-content-brand"
                            : "text-content-tertiary",
                        )}
                      />
                    )}
                  </motion.div>

                  <span
                    className={cn(
                      "text-[12px]",
                      isActive ? "text-content-bold" : "text-content-tertiary",
                    )}
                  >
                    {label}
                  </span>
                </Link>
              ) : (
                <div className="w-full h-full" />
              )}
            </div>
          );
        })}

        <div className="absolute left-1/2 -translate-x-1/2 -top-4">
          <motion.div whileTap={{ scale: 0.9 }}>
            <Link
              href={RouteAddress.CREATE.BASE}
              className="flex items-center justify-center w-16 h-16 rounded-full bg-surface-brand-fill text-content-white shadow-lg"
            >
              <PlusIcon size={32} />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default BottomNavigation;
