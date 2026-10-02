"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CaretLeft,
  DeviceMobileIcon,
  MoonIcon,
  ShieldCheck,
  SignOutIcon,
  SunIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { RouteAddress } from "@/shared/data/routeAddress";
import { Switch } from "@/shared/components/primitives/switch/Switch";
import { Button } from "@/shared/components/primitives/button/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/primitives/dialog/Dialog";
import { useThemeStore } from "@/services/theme-store/useThemeStore";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useQueryAuthMe } from "@/services/domains/auth/hooks/useQueryAuthMe";
import { useMutateLogout } from "@/services/domains/auth/hooks/useMutateLogout";

const rowClassName = "flex min-h-14 items-center gap-3 px-4 py-3 text-right";

function RowIcon({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background-tertiary">
      <Icon size={19} className="text-primary" />
    </span>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="px-1 text-[13px] font-semibold text-foreground-muted">{title}</h2>
      <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-surface">
        {children}
      </div>
    </section>
  );
}

/**
 * «حساب من» — only what belongs to the person: name, phone, password, appearance, logout.
 * Salon settings live in the salon panel, never here.
 */
export default function SettingsList() {
  const router = useRouter();
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const me = useQueryAuthMe({ enabled: isLoggedIn }).data?.data;
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const { mutateAsync: logout, isPending } = useMutateLogout();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const isLight = theme === "light";
  const fullName = `${me?.firstName ?? ""} ${me?.lastName ?? ""}`.trim();

  const onLogout = async () => {
    try {
      await logout();
    } finally {
      setLogoutOpen(false);
      router.push(RouteAddress.AUTH.LOGIN.BASE);
    }
  };

  return (
    <div className="flex flex-col gap-6 px-safe-area">
      {isLoggedIn ? (
        <Group title="اطلاعات حساب">
          <Link href={RouteAddress.PROFILE.EDIT_NAME} className={rowClassName}>
            <RowIcon icon={UserIcon} />
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-bold text-foreground">نام</span>
              <span className="block truncate text-xs text-foreground-muted">{fullName || "هنوز وارد نشده"}</span>
            </span>
            <CaretLeft size={18} className="text-foreground-muted" />
          </Link>
          <div className={rowClassName}>
            <RowIcon icon={DeviceMobileIcon} />
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-bold text-foreground">موبایل</span>
              <span className="block text-xs text-foreground-muted" dir="ltr">
                {me?.phone ?? "—"}
              </span>
            </span>
            <span className="shrink-0 text-[11px] text-foreground-muted">برای تغییر با پشتیبانی تماس بگیرید</span>
          </div>
          <Link href={RouteAddress.PROFILE.CHANGE_PASSWORD} className={rowClassName}>
            <RowIcon icon={ShieldCheck} />
            <span className="flex-1 text-[14px] font-bold text-foreground">امنیت و رمز عبور</span>
            <CaretLeft size={18} className="text-foreground-muted" />
          </Link>
        </Group>
      ) : null}

      <Group title="ظاهر">
        <div className={rowClassName}>
          <RowIcon icon={isLight ? SunIcon : MoonIcon} />
          <span className="flex-1 text-[14px] font-bold text-foreground">حالت روشن</span>
          <Switch checked={isLight} onCheckedChange={toggleTheme} aria-label="تغییر تم روشن و تاریک" />
        </div>
      </Group>

      {isLoggedIn ? (
        <div className="overflow-hidden rounded-[16px] bg-surface">
          <button type="button" onClick={() => setLogoutOpen(true)} className={`${rowClassName} w-full`}>
            <RowIcon icon={SignOutIcon} />
            <span className="flex-1 text-[14px] font-bold text-foreground">خروج از حساب</span>
          </button>
        </div>
      ) : null}

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>خروج از حساب</DialogTitle>
            <DialogDescription>برای ورود دوباره به شماره موبایل و رمز یا کد پیامکی نیاز دارید.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setLogoutOpen(false)}>
              انصراف
            </Button>
            <Button type="button" isLoading={isPending} onClick={() => void onLogout()}>
              خروج
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
