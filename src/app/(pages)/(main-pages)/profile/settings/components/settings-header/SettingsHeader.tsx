"use client";

import { ArrowRight, SignOut } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useMutateLogout } from "@/services/domains/auth/hooks/useMutateLogout";
import { RouteAddress } from "@/shared/data/routeAddress";

export default function SettingsHeader() {
  const router = useRouter();
  const { mutateAsync: logout, isPending: isLoggingOut } = useMutateLogout();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.push(RouteAddress.AUTH.LOGIN.BASE);
    }
  };

  return (
    <div className="flex items-center justify-between px-safe-area">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface"
      >
        <ArrowRight size={20} className="text-foreground" />
      </button>
      <h1 className="text-[18px] font-bold text-foreground">تنظیمات</h1>
      <button
        type="button"
        disabled={isLoggingOut}
        onClick={handleLogout}
        aria-label="خروج از حساب"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface disabled:opacity-50"
      >
        <SignOut size={20} className="text-foreground" />
      </button>
    </div>
  );
}
