"use client";

import Link from "next/link";
import {
  CaretLeft,
  Gear,
  CalendarBlank,
  CrownSimple,
  Storefront,
  BellSimple,
  HeartIcon,
} from "@phosphor-icons/react";
import { RouteAddress } from "@/shared/data/routeAddress";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useSubscriptionEntitlement } from "@/services/domains/subscriptions/hooks/useSubscriptionEntitlement";
import { remainingSubscriptionDays } from "@/services/domains/subscriptions/utils/subscription-display";

const beforeSubscription = [
  {
    label: "نوبت‌های من",
    icon: CalendarBlank,
    href: RouteAddress.RESERVATION.BASE,
  },
  {
    label: "علاقه‌مندی‌های من",
    icon: HeartIcon,
    href: RouteAddress.FAVORITES.BASE,
  },
  {
    label: "ثبت سالن",
    icon: Storefront,
    href: RouteAddress.ONBOARDING.BASE,
  },
];

const afterSubscription = [
  {
    label: "اعلان‌ها",
    icon: BellSimple,
    href: RouteAddress.NOTIFICATIONS.BASE,
  },
  {
    label: "تنظیمات",
    icon: Gear,
    href: RouteAddress.PROFILE.SETTINGS,
  },
];

function MenuRow({
  label,
  subtitle,
  icon: Icon,
  href,
}: {
  label: string;
  subtitle?: string;
  icon: React.ElementType;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-[16px] bg-surface p-4 text-right"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background-tertiary">
        <Icon size={20} className="text-primary" />
      </div>
      <div className="flex-1">
        <span className="block text-[14px] font-bold text-foreground">
          {label}
        </span>
        {subtitle ? (
          <span className="mt-0.5 block text-[12px] text-foreground-muted">
            {subtitle}
          </span>
        ) : null}
      </div>
      <CaretLeft size={18} className="text-foreground-muted" />
    </Link>
  );
}

function SubscriptionMenuRow() {
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const { isBillable, entitlement } = useSubscriptionEntitlement();
  const remainingDays = remainingSubscriptionDays(entitlement?.endDate);

  const hasActiveSubscription = isLoggedIn && isBillable;
  const label = hasActiveSubscription ? "اشتراک فعال دارید" : "خرید اشتراک";
  const subtitle =
    hasActiveSubscription && remainingDays != null
      ? `باقی‌مانده اعتبار: ${remainingDays.toLocaleString("fa-IR")} روز`
      : undefined;

  return (
    <MenuRow
      label={label}
      subtitle={subtitle}
      icon={CrownSimple}
      href={RouteAddress.SUBSCRIPTIONS.BASE}
    />
  );
}

export default function ProfileMenuList() {
  return (
    <div className="flex flex-col gap-2 px-safe-area">
      {beforeSubscription.map((item) => (
        <MenuRow key={item.label} {...item} />
      ))}
      <SubscriptionMenuRow />
      {afterSubscription.map((item) => (
        <MenuRow key={item.label} {...item} />
      ))}
    </div>
  );
}
