"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { RouteAddress } from "@/shared/data/routeAddress";
import {
  useSalonContextStore,
  ISalonMembership,
} from "@/services/salon-context-store/useSalonContextStore";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useQueryAuthMe } from "@/services/domains/auth/hooks/useQueryAuthMe";
import { useSelectPanelSalon } from "@/services/salon-context-store/useSelectPanelSalon";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { mapAuthMeMembershipsToSalon } from "@/services/salon-context-store/mapAuthMeMembership";
import { getLoginHref } from "@/shared/utils/authRedirect";
import { useSubscriptionEntitlement } from "@/services/domains/subscriptions/hooks/useSubscriptionEntitlement";
import { SalonRoleName, SalonApprovalStatus } from "@/services/common/enums/domain-enums";
import SubscriptionLockBanner from "@/shared/components/composites/subscription-lock-banner/SubscriptionLockBanner";
import { salonRoleLabel } from "@/shared/utils/salonRoleLabel";
import QuickBookDrawer from "./QuickBookDrawer";
import {
  DashboardToast,
  PanelBottomNav,
  PanelHeader,
  PanelSideNav,
  PanelSubnav,
  getActivePanelNavItem,
  getPanelNav,
  useQuickBookStore,
  type DashboardToastState,
} from "./_components";

function Transferring() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-sm text-foreground-muted">
      <div className="h-8 w-8 animate-pulse rounded-full bg-primary/30" />
      در حال انتقال…
    </div>
  );
}

function SalonSelectPanel({
  memberships,
  onSelect,
  onBackHome,
}: {
  memberships: ISalonMembership[];
  onSelect: (m: ISalonMembership) => void;
  onBackHome: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background px-safe-area py-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <div>
          <p className="text-xs text-foreground-muted">پنل سالن</p>
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
              key={m.salonPublicId ?? m.salonId}
              type="button"
              onClick={() => onSelect(m)}
              className="flex items-center gap-3 rounded-[20px] border border-border bg-surface p-4 text-right transition-colors hover:bg-surface-hover"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-input text-[14px] font-bold text-foreground">
                {m.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-foreground">{m.name}</p>
                {m.roleName ? (
                  <p className="text-[12px] text-foreground-muted">
                    {salonRoleLabel(m.roleName)}
                  </p>
                ) : null}
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onBackHome}
          className="text-sm font-medium text-foreground-muted"
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
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const memberships = useSalonContextStore((s) => s.memberships);
  const lastSalonPublicId = useSalonContextStore((s) => s.lastSalonPublicId);
  const clearContext = useSalonContextStore((s) => s.clearContext);

  const { data, isSuccess, isError } = useQueryAuthMe({
    enabled: tokenReady && isLoggedIn,
  });
  const selectSalon = useSelectPanelSalon();
  const { isEntitled, isLoading: entitlementLoading } =
    useSubscriptionEntitlement();

  // Owner-facing dashboard must stay locked until the active salon is Approved —
  // Draft/Pending/Rejected salons still belong in the onboarding wizard.
  const { data: activeSalonRes, isSuccess: activeSalonFetched } =
    useQuerySalonById(salonId != null ? salonPublicId ?? undefined : undefined);
  const activeApprovalStatus = activeSalonRes?.data?.approvalStatus;

  useEffect(() => {
    if (salonId == null || !activeSalonFetched) return;
    if (
      activeApprovalStatus != null &&
      activeApprovalStatus !== SalonApprovalStatus.Approved
    ) {
      router.replace(RouteAddress.ONBOARDING.BASE);
    }
  }, [salonId, activeSalonFetched, activeApprovalStatus, router]);

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

  const membershipList = useMemo(() => {
    const fromMe = mapAuthMeMembershipsToSalon(data?.data?.memberships);
    return fromMe.length > 0 ? fromMe : memberships;
  }, [data, memberships]);

  // ADR-0012: picking a salon is local to this tab (no API call, no token swap).
  useEffect(() => {
    if (!hasHydrated || !tokenReady) return;

    if (!isLoggedIn) {
      // Return to the exact dashboard page (e.g. /dashboard/my-appointments from an SMS link).
      router.replace(getLoginHref(pathname || RouteAddress.DASHBOARD.BASE));
      return;
    }

    if (!isSuccess && !isError) return;

    if (salonPublicId != null) {
      // Membership revoked since this tab picked the salon → pick again.
      if (isSuccess && !membershipList.some((m) => m.salonPublicId === salonPublicId)) {
        clearContext();
        return;
      }
      setNeedsSalonPick(false);
      return;
    }

    if (membershipList.length === 0) {
      setNeedsSalonPick(false);
      router.replace(RouteAddress.HOME.BASE);
      return;
    }

    // Last salon used in any tab, or the only one → auto-pick; otherwise ask once.
    const preferred =
      membershipList.find((m) => m.salonPublicId === lastSalonPublicId) ??
      (membershipList.length === 1 ? membershipList[0] : undefined);

    if (!preferred) {
      setNeedsSalonPick(true);
      return;
    }

    selectSalon(preferred);
    setNeedsSalonPick(false);
  }, [
    hasHydrated,
    tokenReady,
    isLoggedIn,
    isSuccess,
    isError,
    salonPublicId,
    lastSalonPublicId,
    membershipList,
    clearContext,
    selectSalon,
    pathname,
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
        onSelect={(m) => {
          selectSalon(m);
          setNeedsSalonPick(false);
        }}
        onBackHome={() => router.replace(RouteAddress.HOME.BASE)}
      />
    );
  }

  const readyToRender =
    hasHydrated && tokenReady && isLoggedIn && meSettled && salonId != null;

  if (!readyToRender || !activeSalonFetched) {
    return <Transferring />;
  }

  if (
    activeApprovalStatus != null &&
    activeApprovalStatus !== SalonApprovalStatus.Approved
  ) {
    // useEffect above kicks off router.replace(ONBOARDING.BASE); render nothing meanwhile.
    return <Transferring />;
  }

  const activeRoleName = memberships.find((m) => m.salonId === salonId)?.roleName;
  const isStaff = activeRoleName === SalonRoleName.Staff;
  const activeItem = getActivePanelNavItem(getPanelNav(isStaff), pathname);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <PanelHeader />
      <div className="flex w-full flex-1">
        <PanelSideNav pathname={pathname} isStaff={isStaff} />
        <div className="flex min-w-0 flex-1 flex-col">
          <PanelSubnav item={activeItem} pathname={pathname} />
          {!isStaff && !entitlementLoading && !isEntitled ? (
            <SubscriptionLockBanner />
          ) : null}
          <div className="w-full flex-1">{children}</div>
        </div>
      </div>
      <PanelBottomNav pathname={pathname} isStaff={isStaff} />
      <PanelQuickBook />
    </div>
  );
}

/** The one quick-book drawer of the panel, opened by «＋» in the nav (any page). */
function PanelQuickBook() {
  const open = useQuickBookStore((s) => s.open);
  const date = useQuickBookStore((s) => s.date);
  const setOpen = useQuickBookStore((s) => s.setOpen);
  const [toast, setToast] = useState<DashboardToastState>(null);

  return (
    <>
      <QuickBookDrawer open={open} onOpenChange={setOpen} date={date} onToast={setToast} />
      <DashboardToast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
