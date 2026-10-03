"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowsLeftRightIcon,
  BellIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CheckIcon,
  MoonIcon,
  SignOutIcon,
  StorefrontIcon,
  SunIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import BottomSheet from "@/shared/components/composites/bottom-sheet/BottomSheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/primitives/dialog/Dialog";
import { Button } from "@/shared/components/primitives/button/Button";
import { Switch } from "@/shared/components/primitives/switch/Switch";
import { useQueryAuthMe } from "@/services/domains/auth/hooks/useQueryAuthMe";
import { useMutateLogout } from "@/services/domains/auth/hooks/useMutateLogout";
import { useThemeStore } from "@/services/theme-store/useThemeStore";
import {
  useSalonContextStore,
  ISalonMembership,
} from "@/services/salon-context-store/useSalonContextStore";
import { useSelectPanelSalon } from "@/services/salon-context-store/useSelectPanelSalon";
import { RouteAddress } from "@/shared/data/routeAddress";
import { salonImageSrc } from "@/shared/utils/salonDisplay";
import { salonRoleLabel } from "@/shared/utils/salonRoleLabel";
import { cn } from "@/shared/utils/className";
import { APP_LOCALE } from "@/shared/utils/locale";
import { useQueryUnreadNotificationsCount } from "@/services/domains/notifications/hooks";
import { dashboardQuietButtonClass } from "./buttonClasses";

const rowClass =
  "flex min-h-12 w-full items-center gap-3 rounded-[12px] px-3 text-right text-sm font-semibold text-foreground transition-colors hover:bg-surface-hover";

function SalonList({
  memberships,
  activeSalonPublicId,
  onSelect,
}: {
  memberships: ISalonMembership[];
  activeSalonPublicId: string | null;
  onSelect: (m: ISalonMembership) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      {memberships.map((m) => {
        const active = m.salonPublicId === activeSalonPublicId;
        return (
          <button
            key={m.salonPublicId ?? m.salonId}
            type="button"
            onClick={() => onSelect(m)}
            className={cn(rowClass, active && "bg-surface-brand")}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-hover text-sm font-bold">
              {m.name.charAt(0)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate">{m.name}</span>
              <span className="block text-xs font-normal text-foreground-muted">
                {salonRoleLabel(m.roleName)}
              </span>
            </span>
            {active ? <CheckIcon size={18} className="text-primary" /> : null}
          </button>
        );
      })}
    </div>
  );
}

/** Panel header: salon name (switcher when there are several), notifications, and the account menu. */
export function PanelHeader() {
  const router = useRouter();
  const salonName = useSalonContextStore((s) => s.salonName);
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const memberships = useSalonContextStore((s) => s.memberships);
  const selectSalon = useSelectPanelSalon();
  const { data } = useQueryAuthMe();
  const unread = useQueryUnreadNotificationsCount().data ?? 0;
  const me = data?.data;
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const { mutateAsync: logout, isPending: isLoggingOut } = useMutateLogout();

  const [accountOpen, setAccountOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const canSwitch = memberships.length > 1;
  const fullName = `${me?.firstName ?? ""} ${me?.lastName ?? ""}`.trim() || "حساب من";
  const avatarSrc = me?.avatarUrl ? salonImageSrc(me.avatarUrl, "") : "";
  const activeRole = memberships.find((m) => m.salonPublicId === salonPublicId)?.roleName;

  const onSelectSalon = (m: ISalonMembership) => {
    setSwitchOpen(false);
    setAccountOpen(false);
    if (m.salonPublicId === salonPublicId) return;
    selectSalon(m);
    router.push(RouteAddress.DASHBOARD.BASE);
  };

  const onLogout = async () => {
    try {
      await logout();
    } finally {
      setLogoutOpen(false);
      router.push(RouteAddress.AUTH.LOGIN.BASE);
    }
  };

  const salonTitle = (
    <span className="min-w-0">
      <span className="block truncate text-[15px] font-bold text-foreground">
        {salonName || "سالن"}
      </span>
      <span className="block text-[11px] text-foreground-muted">
        {salonRoleLabel(activeRole)}
      </span>
    </span>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-safe-area backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-3">
        {canSwitch ? (
          <button
            type="button"
            onClick={() => setSwitchOpen(true)}
            className="flex min-w-0 items-center gap-1.5 text-right"
            aria-label="تعویض سالن"
          >
            {salonTitle}
            <CaretDownIcon size={14} className="shrink-0 text-foreground-muted" />
          </button>
        ) : (
          salonTitle
        )}

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={RouteAddress.DASHBOARD.NOTIFICATIONS}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface-hover"
            aria-label={unread ? `اعلان‌ها، ${unread.toLocaleString(APP_LOCALE)} خوانده‌نشده` : "اعلان‌ها"}
          >
            <BellIcon size={19} className="text-foreground" />
            {unread ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold leading-none text-primary-foreground">
                {unread > 99 ? "99+" : unread.toLocaleString(APP_LOCALE)}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            onClick={() => setAccountOpen(true)}
            className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-surface-brand text-sm font-bold text-content-brand"
            aria-label="منوی حساب"
          >
            {avatarSrc ? (
              <Image src={avatarSrc} alt={fullName} fill unoptimized className="object-cover" />
            ) : (
              fullName.charAt(0)
            )}
          </button>
        </div>
      </div>

      <BottomSheet open={switchOpen} onClose={() => setSwitchOpen(false)}>
        <h2 className="mb-3 text-base font-bold text-foreground">تعویض سالن</h2>
        <SalonList
          memberships={memberships}
          activeSalonPublicId={salonPublicId}
          onSelect={onSelectSalon}
        />
      </BottomSheet>

      <BottomSheet open={accountOpen} onClose={() => setAccountOpen(false)}>
        <div className="mb-4 flex items-center gap-3">
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-brand text-base font-bold text-content-brand">
            {avatarSrc ? (
              <Image src={avatarSrc} alt={fullName} fill unoptimized className="object-cover" />
            ) : (
              fullName.charAt(0)
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-bold text-foreground">{fullName}</span>
            {me?.phone ? (
              <span className="block text-xs text-foreground-muted" dir="ltr">
                {me.phone}
              </span>
            ) : null}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <Link
            href={RouteAddress.PROFILE.SETTINGS}
            onClick={() => setAccountOpen(false)}
            className={rowClass}
          >
            <UserCircleIcon size={20} className="text-foreground-muted" />
            <span className="flex-1">حساب من</span>
            <CaretLeftIcon size={16} className="text-foreground-muted" />
          </Link>

          <div className={rowClass}>
            {theme === "light" ? (
              <SunIcon size={20} className="text-foreground-muted" />
            ) : (
              <MoonIcon size={20} className="text-foreground-muted" />
            )}
            <span className="flex-1">حالت روشن</span>
            <Switch
              checked={theme === "light"}
              onCheckedChange={toggleTheme}
              aria-label="تغییر تم روشن و تاریک"
            />
          </div>

          {canSwitch ? (
            <button
              type="button"
              onClick={() => {
                setAccountOpen(false);
                setSwitchOpen(true);
              }}
              className={rowClass}
            >
              <ArrowsLeftRightIcon size={20} className="text-foreground-muted" />
              <span className="flex-1">تعویض سالن</span>
              <CaretLeftIcon size={16} className="text-foreground-muted" />
            </button>
          ) : null}

          <Link
            href={RouteAddress.HOME.BASE}
            onClick={() => setAccountOpen(false)}
            className={rowClass}
          >
            <StorefrontIcon size={20} className="text-foreground-muted" />
            <span className="flex-1">رفتن به اپ مشتری</span>
            <CaretLeftIcon size={16} className="text-foreground-muted" />
          </Link>

          <div className="my-1 h-px bg-border" />

          <button
            type="button"
            onClick={() => {
              setAccountOpen(false);
              setLogoutOpen(true);
            }}
            className={rowClass}
          >
            <SignOutIcon size={20} className="text-foreground-muted" />
            <span className="flex-1">خروج از حساب</span>
          </button>
        </div>
      </BottomSheet>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>خروج از حساب</DialogTitle>
            <DialogDescription>
              برای ورود دوباره به شماره موبایل و رمز یا کد پیامکی نیاز دارید.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              className={dashboardQuietButtonClass}
              onClick={() => setLogoutOpen(false)}
            >
              انصراف
            </Button>
            <Button type="button" onClick={() => void onLogout()} isLoading={isLoggingOut}>
              خروج
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
