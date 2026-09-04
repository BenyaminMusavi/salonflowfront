import { RouteAddress } from "@/shared/data/routeAddress";

export type OwnerNavTab = {
  href: string;
  label: string;
  /** Requires the SalonOwner role — hidden from the dashboard for Staff (SF-QA-009). */
  ownerOnly?: boolean;
};

export type OwnerNavGroup = {
  id: "today" | "insight" | "ops" | "money";
  href: string;
  label: string;
  tabs: OwnerNavTab[];
  /** Requires the SalonOwner role — hidden from the dashboard for Staff (SF-QA-009). */
  ownerOnly?: boolean;
};

export const OWNER_NAV_GROUPS: OwnerNavGroup[] = [
  {
    id: "today",
    href: RouteAddress.DASHBOARD.BASE,
    label: "امروز",
    tabs: [],
  },
  {
    id: "insight",
    href: RouteAddress.DASHBOARD.ANALYTICS,
    label: "بینش",
    tabs: [
      { href: RouteAddress.DASHBOARD.ANALYTICS, label: "تحلیل" },
      { href: RouteAddress.DASHBOARD.REPORTS, label: "گزارش‌ها" },
    ],
  },
  {
    id: "ops",
    href: RouteAddress.DASHBOARD.CATALOG,
    label: "عملیات",
    tabs: [
      { href: RouteAddress.DASHBOARD.CATALOG, label: "کاتالوگ" },
      { href: RouteAddress.DASHBOARD.STAFF, label: "پرسنل", ownerOnly: true },
      { href: RouteAddress.DASHBOARD.STAFF_SERVICES, label: "خدمات پرسنل" },
      { href: RouteAddress.DASHBOARD.SCHEDULES, label: "برنامه" },
      { href: RouteAddress.DASHBOARD.SALON_INFO, label: "اطلاعات سالن" },
    ],
  },
  {
    id: "money",
    href: RouteAddress.DASHBOARD.FINANCE,
    label: "مالی",
    ownerOnly: true,
    tabs: [
      { href: RouteAddress.DASHBOARD.FINANCE, label: "مالی" },
      { href: RouteAddress.DASHBOARD.Z_REPORT, label: "Z-Report" },
      { href: RouteAddress.DASHBOARD.PAYOUTS, label: "تسویه" },
    ],
  },
];

/** Dashboard nav filtered for the current role — drops owner-only groups/tabs for Staff (SF-QA-009). */
export function getVisibleNavGroups(isStaff: boolean): OwnerNavGroup[] {
  if (!isStaff) return OWNER_NAV_GROUPS;
  return OWNER_NAV_GROUPS.filter((group) => !group.ownerOnly).map((group) => ({
    ...group,
    tabs: group.tabs.filter((tab) => !tab.ownerOnly),
  }));
}

function normalizePath(pathname: string): string {
  const clean = pathname.split("?")[0].replace(/\/$/, "");
  return clean || "/";
}

export function getOwnerNavGroup(pathname: string): OwnerNavGroup | null {
  const path = normalizePath(pathname);

  if (path === RouteAddress.DASHBOARD.BASE) {
    return OWNER_NAV_GROUPS[0];
  }

  return (
    OWNER_NAV_GROUPS.find((group) =>
      group.tabs.some((tab) => path === tab.href)
    ) ?? null
  );
}

export function isOwnerNavGroupActive(
  group: OwnerNavGroup,
  pathname: string
): boolean {
  const path = normalizePath(pathname);
  if (group.id === "today") {
    return path === RouteAddress.DASHBOARD.BASE;
  }
  return group.tabs.some((tab) => path === tab.href);
}
