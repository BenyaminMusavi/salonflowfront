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
import { APP_LOCALE } from "@/shared/utils/locale";
import { useQueryUnreadNotificationsCount } from "@/services/domains/notifications/hooks";

function HomeHeader() {
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const { data } = useQueryAuthMe();
  const me = data?.data;
  const firstName = me?.firstName?.trim() || "";
  const unread = useQueryUnreadNotificationsCount(isLoggedIn).data ?? 0;

  if (!isLoggedIn) {
    return (
      <Header>
        <div className="flex items-center gap-x-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground/5 text-foreground">
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
      <Link href={RouteAddress.PROFILE.BASE} className="flex min-w-0 items-center gap-x-2" aria-label="پروفایل">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-brand text-lg font-bold text-content-brand">
          {firstName ? firstName.charAt(0) : <UserIcon size={24} />}
        </div>
        <div className="flex min-w-0 flex-col gap-y-0.5">
          <span className="truncate text-[15px] font-bold text-foreground">
            {firstName ? `سلام، ${firstName}` : "سلام"}
          </span>
          <span className="text-[12px] text-foreground-muted">امروز نوبت کجا بگیریم؟</span>
        </div>
      </Link>
      <div className="flex shrink-0 items-center gap-x-2">
        <BusinessSwitcher />
        <Link
          href={RouteAddress.NOTIFICATIONS.BASE}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-foreground/10 text-foreground"
          aria-label={unread ? `اعلان‌ها، ${unread.toLocaleString(APP_LOCALE)} خوانده‌نشده` : "اعلان‌ها"}
        >
          <BellIcon size={22} />
          {unread ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold leading-none text-primary-foreground">
              {unread > 99 ? "99+" : unread.toLocaleString(APP_LOCALE)}
            </span>
          ) : null}
        </Link>
      </div>
    </Header>
  );
}

export default HomeHeader;
