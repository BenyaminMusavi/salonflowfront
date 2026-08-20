import { RouteAddress } from "@/shared/data/routeAddress";

export type OwnerNavTab = {
  href: string;
  label: string;
};

export type OwnerNavGroup = {
  id: "today" | "insight" | "ops" | "money";
  href: string;
  label: string;
  tabs: OwnerNavTab[];
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
      { href: RouteAddress.DASHBOARD.STAFF_SERVICES, label: "پرسنل" },
      { href: RouteAddress.DASHBOARD.SCHEDULES, label: "برنامه" },
      { href: RouteAddress.DASHBOARD.SALON_INFO, label: "اطلاعات سالن" },
    ],
  },
  {
    id: "money",
    href: RouteAddress.DASHBOARD.FINANCE,
    label: "مالی",
    tabs: [
      { href: RouteAddress.DASHBOARD.FINANCE, label: "مالی" },
      { href: RouteAddress.DASHBOARD.Z_REPORT, label: "Z-Report" },
      { href: RouteAddress.DASHBOARD.PAYOUTS, label: "تسویه" },
    ],
  },
];

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
