"use client";
import React from "react";
import Link from "next/link";
import Header from "@/shared/components/composites/layout/header/Header";
import { BellIcon, UserIcon } from "@phosphor-icons/react/ssr";
import BusinessSwitcher from "@/shared/components/composites/layout/business-switcher/BusinessSwitcher";
import { useQueryAuthMe } from "@/services/domains/auth/hooks/useQueryAuthMe";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { RouteAddress } from "@/shared/data/routeAddress";
import { getLoginHref } from "@/shared/utils/authRedirect";

function HomeHeader() {
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const { data } = useQueryAuthMe();
  const me = data?.data;
  const fullName =
    `${me?.firstName ?? ""} ${me?.lastName ?? ""}`.trim() || "کاربر";

  if (!isLoggedIn) {
    return (
      <Header>
        <div className="flex items-center gap-x-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground/5 text-white">
            <UserIcon size={24} />
          </div>
          <div className="flex flex-col gap-y-1">
            <span className="text-[14px] text-foreground">مهمان</span>
            <span className="text-[12px] text-foreground-muted">
              برای رزرو و پنل سالن وارد شوید
            </span>
          </div>
        </div>
        <Link
          href={getLoginHref(RouteAddress.HOME.BASE)}
          className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
        >
          ورود
        </Link>
      </Header>
    );
  }

  return (
    <Header>
      <div className="flex items-center gap-x-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground/5 text-white">
          <UserIcon size={24} />
        </div>
        <div className="flex flex-col gap-y-1">
          <span className="text-[14px] text-foreground">{fullName}</span>
          <span className="text-[12px] text-foreground" dir="ltr">
            {me?.phone ?? ""}
          </span>
        </div>
      </div>
      <div className="flex gap-x-3">
        <Link
          href={RouteAddress.NOTIFICATIONS.BASE}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/10 text-white"
          aria-label="اعلان‌ها"
        >
          <BellIcon size={24} />
        </Link>
        <BusinessSwitcher />
      </div>
    </Header>
  );
}

export default HomeHeader;
