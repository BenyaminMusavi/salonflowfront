"use client";

import Link from "next/link";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { RouteAddress } from "@/shared/data/routeAddress";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <MagnifyingGlassIcon
        size={48}
        weight="bold"
        className="text-foreground-muted"
      />
      <h1 className="text-lg font-bold text-foreground">صفحه یافت نشد</h1>
      <p className="text-sm text-foreground-muted">
        صفحه‌ای که دنبال آن بودید پیدا نشد یا جابه‌جا شده است.
      </p>
      <Link
        href={RouteAddress.HOME.BASE}
        className="mt-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        بازگشت به خانه
      </Link>
    </div>
  );
}
