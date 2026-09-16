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
  ShieldCheckIcon,
} from "@phosphor-icons/react";
import { RouteAddress } from "@/shared/data/routeAddress";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useQueryAuthMe } from "@/services/domains/auth/hooks/useQueryAuthMe";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useSubscriptionEntitlement } from "@/services/domains/subscriptions/hooks/useSubscriptionEntitlement";
import { remainingSubscriptionDays } from "@/services/domains/subscriptions/utils/subscription-display";
import { SalonApprovalStatus, SalonRoleName } from "@/services/common/enums/domain-enums";

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

function AdminPanelMenuRow() {
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const { data } = useQueryAuthMe({ enabled: isLoggedIn });

  if (!data?.data?.isAdmin) return null;

  return (
    <MenuRow
      label="پنل مدیریت"
      icon={ShieldCheckIcon}
      href={RouteAddress.ADMIN.BASE}
    />
  );
}

/** Only for users with at least one salon membership (owner/staff) — the dashboard's
 * own notifications, surfaced here too instead of only being reachable from inside it. */
function SalonNotificationsMenuRow() {
  const memberships = useSalonContextStore((s) => s.memberships);
  if (memberships.length === 0) return null;

  return (
    <MenuRow
      label="اعلان‌های سالن"
      icon={BellSimple}
      href={RouteAddress.DASHBOARD.NOTIFICATIONS}
    />
  );
}

/**
 * State-aware "ثبت سالن" row: no salon yet -> starts the wizard fresh; Draft/Rejected ->
 * resumes it (label changes to make that obvious); Pending -> still opens onboarding, which
 * itself shows a read-only "awaiting admin review" screen (nothing to fill in there); Approved
 * -> skips the registration flow entirely and goes straight to the salon's own dashboard.
 */
function SalonRegistrationMenuRow() {
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const { data: authMeData } = useQueryAuthMe({ enabled: isLoggedIn });
  const ownerMembership = authMeData?.data?.memberships?.find(
    (m) => m.roleName === SalonRoleName.SalonOwner
  );
  const { data: salonRes } = useQuerySalonById(ownerMembership?.salonPublicId);
  const status = salonRes?.data?.approvalStatus;

  if (status === SalonApprovalStatus.Approved) {
    return (
      <MenuRow
        label="داشبورد سالن"
        icon={Storefront}
        href={RouteAddress.DASHBOARD.BASE}
      />
    );
  }

  const label =
    ownerMembership && status === SalonApprovalStatus.Pending
      ? "ثبت سالن (در حال بررسی)"
      : ownerMembership &&
          (status === SalonApprovalStatus.Draft ||
            status === SalonApprovalStatus.Rejected)
        ? "تکمیل ثبت سالن"
        : "ثبت سالن";

  return (
    <MenuRow label={label} icon={Storefront} href={RouteAddress.ONBOARDING.BASE} />
  );
}

export default function ProfileMenuList() {
  return (
    <div className="flex flex-col gap-2 px-safe-area">
      <AdminPanelMenuRow />
      <SalonNotificationsMenuRow />
      {beforeSubscription.map((item) => (
        <MenuRow key={item.label} {...item} />
      ))}
      <SalonRegistrationMenuRow />
      <SubscriptionMenuRow />
      {afterSubscription.map((item) => (
        <MenuRow key={item.label} {...item} />
      ))}
    </div>
  );
}
