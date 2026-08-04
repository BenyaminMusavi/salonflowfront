"use client";

import Link from "next/link";
import {
  CaretLeft,
  Gear,
  CalendarBlank,
  CrownSimple,
} from "@phosphor-icons/react";
import { RouteAddress } from "@/shared/data/routeAddress";

const items = [
  {
    label: "نوبت‌های من",
    icon: CalendarBlank,
    href: RouteAddress.RESERVATION.BASE,
  },
  {
    label: "اشتراک پلتفرم",
    icon: CrownSimple,
    href: RouteAddress.SUBSCRIPTIONS.BASE,
  },
  {
    label: "تنظیمات",
    icon: Gear,
    href: RouteAddress.PROFILE.SETTINGS,
  },
];

export default function ProfileMenuList() {
  return (
    <div className="flex flex-col gap-2 px-safe-area">
      {items.map(({ label, icon: Icon, href }) => (
        <Link
          key={label}
          href={href}
          className="flex items-center gap-3 rounded-[16px] bg-surface p-4 text-right"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background-tertiary">
            <Icon size={20} className="text-primary" />
          </div>
          <span className="flex-1 text-[14px] font-bold text-foreground">
            {label}
          </span>
          <CaretLeft size={18} className="text-foreground-muted" />
        </Link>
      ))}
    </div>
  );
}
