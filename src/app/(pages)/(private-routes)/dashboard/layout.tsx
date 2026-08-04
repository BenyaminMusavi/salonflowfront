"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { RouteAddress } from "@/shared/data/routeAddress";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { cn } from "@/shared/utils/className";
import { BellIcon } from "@phosphor-icons/react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const setRedirectUrl = useTokenStore((s) => s.setRedirectUrl);
  const salonId = useSalonContextStore((s) => s.salonId);
  const salonName = useSalonContextStore((s) => s.salonName);

  useEffect(() => {
    if (!isLoggedIn) {
      setRedirectUrl(RouteAddress.DASHBOARD.BASE);
      router.replace(RouteAddress.AUTH.LOGIN.BASE);
      return;
    }
    if (!salonId) {
      router.replace(RouteAddress.HOME.BASE);
    }
  }, [isLoggedIn, salonId, router, setRedirectUrl]);

  if (!isLoggedIn || !salonId) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-foreground-muted">
        در حال انتقال…
      </div>
    );
  }

  const tabs = [
    { href: RouteAddress.DASHBOARD.BASE, label: "تخته روزانه" },
    { href: RouteAddress.DASHBOARD.CATALOG, label: "کاتالوگ" },
    { href: RouteAddress.DASHBOARD.STAFF_SERVICES, label: "خدمات پرسنل" },
    { href: RouteAddress.DASHBOARD.SCHEDULES, label: "برنامه پرسنل" },
    { href: RouteAddress.DASHBOARD.FINANCE, label: "مالی" },
    { href: RouteAddress.DASHBOARD.Z_REPORT, label: "Z-Report" },
    { href: RouteAddress.DASHBOARD.PAYOUTS, label: "تسویه/کمیسیون" },
    { href: RouteAddress.DASHBOARD.SALON_INFO, label: "اطلاعات سالن" },
    { href: RouteAddress.HOME.BASE, label: "بازگشت به مشتری" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="border-b border-border px-safe-area py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-foreground-muted">پنل سالن‌دار</p>
            <p className="text-sm font-bold text-foreground">
              {salonName || `سالن #${salonId}`}
            </p>
          </div>
          <Link
            href={RouteAddress.DASHBOARD.NOTIFICATIONS}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-tertiary"
            aria-label="اعلان‌ها"
          >
            <BellIcon size={18} className="text-foreground" />
          </Link>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto px-safe-area py-2">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap",
              pathname === tab.href
                ? "bg-primary text-primary-foreground"
                : "bg-surface-tertiary text-foreground-muted"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}

