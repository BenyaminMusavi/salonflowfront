"use client";

import Link from "next/link";
import { useState } from "react";
import HelpSheet from "../help-sheet/HelpSheet";
import {
  CaretLeft,
  Gear,
  CalendarBlank,
  CrownSimple,
  Storefront,
  BellSimple,
  HeartIcon,
  ShieldCheckIcon,
  WalletIcon,
  ChatCircleDotsIcon,
} from "@phosphor-icons/react";
import { RouteAddress } from "@/shared/data/routeAddress";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useQueryAuthMe } from "@/services/domains/auth/hooks/useQueryAuthMe";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useSubscriptionEntitlement } from "@/services/domains/subscriptions/hooks/useSubscriptionEntitlement";
import { remainingSubscriptionDays } from "@/services/domains/subscriptions/utils/subscription-display";
import { SalonApprovalStatus, SalonRoleName } from "@/services/common/enums/domain-enums";
import { APP_LOCALE } from "@/shared/utils/locale";

/** «من»: one row per destination — no tiles repeating the same links. */
const mine = [
  { label: "نوبت‌های من", icon: CalendarBlank, href: RouteAddress.RESERVATION.BASE },
  { label: "علاقه‌مندی‌های من", icon: HeartIcon, href: RouteAddress.FAVORITES.BASE },
  { label: "اعلان‌ها", icon: BellSimple, href: RouteAddress.NOTIFICATIONS.BASE },
  // Wallet top-up is off for now; the page only shows the balance.
  { label: "کیف پول", subtitle: "موجودی و تراکنش‌ها", icon: WalletIcon, href: RouteAddress.WALLET.BASE },
  { label: "حساب من", icon: Gear, href: RouteAddress.PROFILE.SETTINGS },
];

function GroupTitle({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 px-1 text-xs font-semibold text-foreground-muted first:mt-0">{children}</p>;
}

function HelpMenuRow() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 rounded-[16px] bg-surface p-4 text-right"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background-tertiary">
          <ChatCircleDotsIcon size={20} className="text-primary" />
        </div>
        <span className="flex-1 text-[14px] font-bold text-foreground">راهنما و پشتیبانی</span>
        <CaretLeft size={18} className="text-foreground-muted" />
      </button>
      <HelpSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}

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
  // An approved salon renews from «سالن ← اشتراک» in the panel.
  const { ownsApproved } = useOwnsApprovedSalon();
  const { isBillable, entitlement } = useSubscriptionEntitlement();
  const remainingDays = remainingSubscriptionDays(entitlement?.endDate);

  const hasActiveSubscription = isLoggedIn && isBillable;
  const label = hasActiveSubscription ? "اشتراک فعال دارید" : "خرید اشتراک";
  const subtitle =
    hasActiveSubscription && remainingDays != null
      ? `باقی‌مانده اعتبار: ${remainingDays.toLocaleString(APP_LOCALE)} روز`
      : undefined;

  if (ownsApproved) return null;
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

/** True when the user owns an Approved salon — its subscription and settings live in the panel. */
function useOwnsApprovedSalon(): { ownsApproved: boolean; status?: number | null; hasOwner: boolean } {
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const { data } = useQueryAuthMe({ enabled: isLoggedIn });
  const owner = data?.data?.memberships?.find((m) => m.roleName === SalonRoleName.SalonOwner);
  const status = useQuerySalonById(owner?.salonPublicId).data?.data?.approvalStatus;
  return { ownsApproved: status === SalonApprovalStatus.Approved, status, hasOwner: !!owner };
}

/**
 * Salon entry points in the customer profile — just one row each:
 * - «پنل سالن» for anyone who works in an approved salon (owner or staff). Salon info, staff,
 *   services and notifications are managed inside the panel, not from here.
 * - the registration row while the owner's own salon is not approved yet (new / draft /
 *   in review / rejected → resume in onboarding).
 */
function SalonMenuRows() {
  const memberships = useSalonContextStore((s) => s.memberships);
  const { ownsApproved, status, hasOwner } = useOwnsApprovedSalon();
  const worksInSalon = memberships.length > 0 && (ownsApproved || !hasOwner || memberships.length > 1);

  const registration =
    ownsApproved ? null : hasOwner && status === SalonApprovalStatus.Rejected ? (
      <MenuRow
        label="ویرایش و ارسال مجدد ثبت سالن"
        subtitle="درخواست ثبت سالن شما رد شده است"
        icon={Storefront}
        href={RouteAddress.ONBOARDING.BASE}
      />
    ) : (
      <MenuRow
        label={
          hasOwner && status === SalonApprovalStatus.Pending
            ? "ثبت سالن (در حال بررسی)"
            : hasOwner && status === SalonApprovalStatus.Draft
              ? "تکمیل ثبت سالن"
              : "ثبت سالن"
        }
        icon={Storefront}
        href={RouteAddress.ONBOARDING.BASE}
      />
    );

  return (
    <>
      {worksInSalon ? (
        <MenuRow
          label="پنل سالن"
          subtitle="نوبت‌ها، مشتریان، خدمات و تنظیمات سالن"
          icon={Storefront}
          href={RouteAddress.DASHBOARD.BASE}
        />
      ) : null}
      {registration}
    </>
  );
}

export default function ProfileMenuList() {
  return (
    <div className="flex flex-col gap-2 px-safe-area">
      <GroupTitle>من</GroupTitle>
      {mine.map((item) => (
        <MenuRow key={item.label} {...item} />
      ))}
      <GroupTitle>کسب‌وکار</GroupTitle>
      <AdminPanelMenuRow />
      <SalonMenuRows />
      <SubscriptionMenuRow />
      <GroupTitle>پشتیبانی</GroupTitle>
      <HelpMenuRow />
    </div>
  );
}
