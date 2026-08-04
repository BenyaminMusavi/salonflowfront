"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { RouteAddress } from "@/shared/data/routeAddress";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useQueryAuthMe } from "@/services/domains/auth/hooks/useQueryAuthMe";
import { useMutateSwitchContext } from "@/services/domains/auth/hooks/useMutateSwitchContext";
import { mapAuthMeMembershipsToSalon } from "@/services/salon-context-store/mapAuthMeMembership";
import { cn } from "@/shared/utils/className";
import { BellIcon } from "@phosphor-icons/react";

function Transferring() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-foreground-muted">
      در حال انتقال…
    </div>
  );
}

export default function DashboardLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  // Start false so SSR never touches zustand persist (undefined during prerender).
  const [tokenReady, setTokenReady] = useState(false);
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const setRedirectUrl = useTokenStore((s) => s.setRedirectUrl);

  const hasHydrated = useSalonContextStore((s) => s._hasHydrated);
  const salonId = useSalonContextStore((s) => s.salonId);
  const salonName = useSalonContextStore((s) => s.salonName);
  const memberships = useSalonContextStore((s) => s.memberships);

  const { data, isSuccess, isError } = useQueryAuthMe({
    enabled: tokenReady && isLoggedIn,
  });
  const { mutateAsync: switchContext, isPending: isSwitching } =
    useMutateSwitchContext();

  const autoSwitchStarted = useRef(false);
  const preferredCaptured = useRef(false);
  /** Salon id from first hydrated snapshot; used if context was cleared then /dashboard is reopened. */
  const preferredSalonIdRef = useRef<number | null>(null);

  useEffect(() => {
    const persist = useTokenStore.persist;
    if (!persist) return;

    const unsub = persist.onFinishHydration(() => {
      setTokenReady(true);
    });
    if (persist.hasHydrated()) {
      setTokenReady(true);
    }
    return unsub;
  }, []);

  useEffect(() => {
    if (!hasHydrated || preferredCaptured.current) return;
    preferredCaptured.current = true;
    preferredSalonIdRef.current = salonId;
  }, [hasHydrated, salonId]);

  useEffect(() => {
    if (!hasHydrated || !tokenReady) return;

    if (!isLoggedIn) {
      setRedirectUrl(RouteAddress.DASHBOARD.BASE);
      router.replace(RouteAddress.AUTH.LOGIN.BASE);
      return;
    }

    if (!isSuccess && !isError) return;

    if (salonId != null) return;

    const fromMe = mapAuthMeMembershipsToSalon(data?.data?.memberships);
    const list = fromMe.length > 0 ? fromMe : memberships;

    if (list.length === 0) {
      router.replace(RouteAddress.HOME.BASE);
      return;
    }

    if (autoSwitchStarted.current || isSwitching) return;
    autoSwitchStarted.current = true;

    const preferredId = preferredSalonIdRef.current;
    const target =
      (preferredId != null
        ? list.find((m) => m.salonId === preferredId)
        : undefined) ?? list[0];

    void switchContext({
      salonId: target.salonId,
      branchId: target.branchId ?? null,
      salonName: target.name,
      salonPublicId: target.salonPublicId,
      roleId: target.roleId,
      roleName: target.roleName,
    }).catch(() => {
      autoSwitchStarted.current = false;
      router.replace(RouteAddress.HOME.BASE);
    });
  }, [
    hasHydrated,
    tokenReady,
    isLoggedIn,
    isSuccess,
    isError,
    salonId,
    memberships,
    data,
    isSwitching,
    switchContext,
    router,
    setRedirectUrl,
  ]);

  const meSettled = isSuccess || isError;

  const readyToRender =
    hasHydrated &&
    tokenReady &&
    isLoggedIn &&
    meSettled &&
    salonId != null &&
    !isSwitching;

  if (!readyToRender) {
    return <Transferring />;
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
