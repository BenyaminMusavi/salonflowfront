"use client";

import { UserIcon } from "@phosphor-icons/react/ssr";
import { useQueryAuthMe } from "@/services/domains/auth/hooks/useQueryAuthMe";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import Link from "next/link";
import { RouteAddress } from "@/shared/data/routeAddress";

export default function ProfileAvatar() {
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const { data, isLoading } = useQueryAuthMe();
  const me = data?.data;

  const fullName =
    `${me?.firstName ?? ""} ${me?.lastName ?? ""}`.trim() || "کاربر";
  const initial = fullName.charAt(0);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center gap-3 px-safe-area">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-tertiary">
          <UserIcon size={32} className="text-foreground-muted" />
        </div>
        <p className="text-sm text-foreground-muted">وارد حساب نشده‌اید</p>
        <Link
          href={RouteAddress.AUTH.LOGIN.BASE}
          className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
        >
          ورود / ثبت‌نام
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center">
        <div className="flex h-[80px] w-[80px] items-center justify-center rounded-full bg-gradient-to-br from-border-strong to-background-elevated">
          {isLoading ? (
            <UserIcon size={32} />
          ) : (
            <span className="text-[28px] font-bold text-foreground">
              {initial}
            </span>
          )}
        </div>
      </div>

      <h2 className="mt-2 text-[20px] font-bold text-foreground">
        {isLoading ? "…" : fullName}
      </h2>
      <p className="text-[13px] text-foreground-muted" dir="ltr">
        {me?.phone ?? "—"}
      </p>
    </div>
  );
}
