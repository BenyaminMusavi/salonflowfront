"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { RouteAddress } from "@/shared/data/routeAddress";
import {
  useSalonContextStore,
  ISalonMembership,
} from "@/services/salon-context-store/useSalonContextStore";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useQueryAuthMe } from "@/services/domains/auth/hooks/useQueryAuthMe";
import { useMutateSwitchContext } from "@/services/domains/auth/hooks/useMutateSwitchContext";
import { mapAuthMeMembershipsToSalon } from "@/services/salon-context-store/mapAuthMeMembership";
import { cn } from "@/shared/utils/className";
import { getLoginHref } from "@/shared/utils/authRedirect";
import { BellIcon } from "@phosphor-icons/react";
import { useSubscriptionEntitlement } from "@/services/domains/subscriptions/hooks/useSubscriptionEntitlement";
import SubscriptionLockBanner from "@/shared/components/composites/subscription-lock-banner/SubscriptionLockBanner";

function Transferring() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-foreground-muted">
      در حال انتقال…
    </div>
  );
}

function SalonSelectPanel({
  memberships,
  isSwitching,
  onSelect,
  onBackHome,
}: {
  memberships: ISalonMembership[];
  isSwitching: boolean;
  onSelect: (m: ISalonMembership) => void;
  onBackHome: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background px-safe-area py-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <div>
          <p className="text-xs text-foreground-muted">پنل سالن‌دار</p>
          <h1 className="mt-1 text-lg font-bold text-foreground">
            انتخاب سالن
          </h1>
          <p className="mt-2 text-sm text-foreground-muted">
            برای ورود به داشبورد، سالن مورد نظر را انتخاب کنید.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {memberships.map((m) => (
            <button
              key={m.salonId}
              type="button"
              disabled={isSwitching}
              onClick={() => onSelect(m)}
              className="flex items-center gap-3 rounded-[16px] bg-surface p-4 text-right transition-colors disabled:opacity-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-input text-[14px] font-bold text-foreground">
                {m.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-foreground">{m.name}</p>
                {m.roleName ? (
                  <p className="text-[12px] text-foreground-muted">{m.roleName}</p>
                ) : null}
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={isSwitching}
          onClick={onBackHome}
          className="text-sm font-medium text-foreground-muted disabled:opacity-50"
        >
          بازگشت به اپ مشتری
        </button>
      </div>
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

  const hasHydrated = useSalonContextStore((s) => s._hasHydrated);
  const salonId = useSalonContextStore((s) => s.salonId);
  const salonName = useSalonContextStore((s) => s.salonName);
  const memberships = useSalonContextStore((s) => s.memberships);

  const { data, isSuccess, isError } = useQueryAuthMe({
    enabled: tokenReady && isLoggedIn,
  });
  const { mutateAsync: switchContext, isPending: isSwitching } =
    useMutateSwitchContext();
  const { isEntitled, isLoading: entitlementLoading } =
    useSubscriptionEntitlement();

  const autoSwitchStarted = useRef(false);
  const preferredCaptured = useRef(false);
  /** Salon id from first hydrated snapshot; used if context was cleared then /dashboard is reopened. */
  const preferredSalonIdRef = useRef<number | null>(null);
  const [needsSalonPick, setNeedsSalonPick] = useState(false);

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

  const membershipList = useMemo(() => {
    const fromMe = mapAuthMeMembershipsToSalon(data?.data?.memberships);
    return fromMe.length > 0 ? fromMe : memberships;
  }, [data, memberships]);

  const applySalonContext = async (target: ISalonMembership) => {
    await switchContext({
      salonId: target.salonId,
      branchId: target.branchId ?? null,
      salonName: target.name,
      salonPublicId: target.salonPublicId,
      roleId: target.roleId,
      roleName: target.roleName,
    });
    setNeedsSalonPick(false);
  };

  useEffect(() => {
    if (!hasHydrated || !tokenReady) return;

    if (!isLoggedIn) {
      router.replace(getLoginHref(RouteAddress.DASHBOARD.BASE));
      return;
    }

    if (!isSuccess && !isError) return;

    if (salonId != null) {
      setNeedsSalonPick(false);
      return;
    }

    if (membershipList.length === 0) {
      setNeedsSalonPick(false);
      router.replace(RouteAddress.HOME.BASE);
      return;
    }

    const preferredId = preferredSalonIdRef.current;
    const preferred =
      preferredId != null
        ? membershipList.find((m) => m.salonId === preferredId)
        : undefined;

    // Preferred prior context or single membership → auto switch-context.
    // Multiple memberships with no preferred → force explicit selection.
    if (!preferred && membershipList.length > 1) {
      setNeedsSalonPick(true);
      return;
    }

    if (autoSwitchStarted.current || isSwitching) return;
    autoSwitchStarted.current = true;

    const target = preferred ?? membershipList[0];

    void applySalonContext(target).catch(() => {
      autoSwitchStarted.current = false;
      if (membershipList.length > 1) {
        setNeedsSalonPick(true);
      } else {
        router.replace(RouteAddress.HOME.BASE);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- switch via applySalonContext; avoid re-run loops
  }, [
    hasHydrated,
    tokenReady,
    isLoggedIn,
    isSuccess,
    isError,
    salonId,
    membershipList,
    isSwitching,
    router,
  ]);

  const meSettled = isSuccess || isError;

  if (
    hasHydrated &&
    tokenReady &&
    isLoggedIn &&
    meSettled &&
    salonId == null &&
    needsSalonPick
  ) {
    return (
      <SalonSelectPanel
        memberships={membershipList}
        isSwitching={isSwitching}
        onSelect={(m) => {
          void applySalonContext(m).catch(() => {
            /* keep picker open */
          });
        }}
        onBackHome={() => router.replace(RouteAddress.HOME.BASE)}
      />
    );
  }

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
    { href: RouteAddress.DASHBOARD.ANALYTICS, label: "تحلیل" },
    { href: RouteAddress.DASHBOARD.REPORTS, label: "گزارش‌ها" },
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
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface"
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
                : "bg-surface text-foreground-muted"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      {!entitlementLoading && !isEntitled ? <SubscriptionLockBanner /> : null}
      <div className="w-full">{children}</div>
    </div>
  );
}
