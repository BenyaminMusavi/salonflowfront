"use client";

import Link from "next/link";
import {
  ChatCircleDots,
  Wallet,
  CalendarBlank,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { RouteAddress } from "@/shared/data/routeAddress";

const actions = [
  {
    title: "نوبت‌ها",
    desc: "نوبت‌های من",
    icon: CalendarBlank,
    href: RouteAddress.RESERVATION.BASE,
  },
  {
    title: "کیف پول",
    desc: "موجودی و تراکنش",
    icon: Wallet,
    href: RouteAddress.WALLET.BASE,
  },
  {
    title: "جستجو",
    desc: "پیدا کردن سالن",
    icon: MagnifyingGlass,
    href: RouteAddress.SEARCH.BASE,
  },
  {
    title: "راهنما",
    desc: "پشتیبانی",
    icon: ChatCircleDots,
    href: RouteAddress.PROFILE.SETTINGS,
  },
];

export default function ProfileQuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 px-safe-area">
      {actions.map(({ title, desc, icon: Icon, href }) => (
        <Link
          key={title}
          href={href}
          className="flex flex-col items-start gap-2 rounded-[16px] bg-surface p-4 text-right"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background-tertiary">
            <Icon size={20} className="text-primary" />
          </div>
          <h3 className="text-[14px] font-bold text-foreground">{title}</h3>
          <p className="text-[12px] text-foreground-muted">{desc}</p>
        </Link>
      ))}
    </div>
  );
}
