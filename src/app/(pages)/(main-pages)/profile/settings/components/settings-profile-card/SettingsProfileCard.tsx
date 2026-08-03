"use client";

import { PencilSimple } from "@phosphor-icons/react";
import { useQueryAuthMe } from "@/services/domains/auth/hooks/useQueryAuthMe";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import Link from "next/link";
import { RouteAddress } from "@/shared/data/routeAddress";

export default function SettingsProfileCard() {
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const { data, isLoading } = useQueryAuthMe();
  const me = data?.data;

  const fullName =
    `${me?.firstName ?? ""} ${me?.lastName ?? ""}`.trim() || "کاربر";
  const initial = fullName.charAt(0);

  if (!isLoggedIn) {
    return (
      <div className="mx-safe-area rounded-[16px] bg-surface p-4 text-center">
        <p className="text-sm text-foreground-muted">وارد حساب نشده‌اید</p>
        <Link
          href={RouteAddress.AUTH.LOGIN.BASE}
          className="mt-3 inline-flex text-sm font-bold text-primary"
        >
          ورود
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-safe-area flex items-center gap-3 rounded-[16px] bg-surface p-4">
      <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-border-strong to-background-elevated">
        <span className="text-[18px] font-bold text-foreground">
          {isLoading ? "…" : initial}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="truncate text-[14px] font-bold text-foreground">
          {isLoading ? "…" : fullName}
        </h3>
        <p className="text-[12px] text-foreground-muted" dir="ltr">
          {me?.phone ?? "—"}
        </p>
      </div>

      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-background-tertiary"
        aria-label="ویرایش"
      >
        <PencilSimple size={16} className="text-primary" />
      </button>
    </div>
  );
}
