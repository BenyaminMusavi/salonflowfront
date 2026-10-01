import { RouteAddress } from "@/shared/data/routeAddress";

export type PanelNavId = "appointments" | "customers" | "book" | "money" | "salon" | "me";

export type PanelNavTab = {
  href: string;
  label: string;
};

export type PanelNavItem = {
  id: PanelNavId;
  label: string;
  /** Missing for `book`, which opens the quick-book drawer instead of navigating. */
  href?: string;
  /** Routes (and their sub-routes) that light this item up. `/dashboard` itself only matches exactly. */
  matches: string[];
  /** In-section tabs shown under the header (only «مالی» has them for now). */
  tabs?: PanelNavTab[];
};

const D = RouteAddress.DASHBOARD;

const APPOINTMENTS: PanelNavItem = {
  id: "appointments",
  label: "نوبت‌ها",
  href: D.BASE,
  matches: [D.BASE],
};

const CUSTOMERS: PanelNavItem = {
  id: "customers",
  label: "مشتریان",
  href: D.CUSTOMERS,
  matches: [D.CUSTOMERS],
};

const BOOK: PanelNavItem = { id: "book", label: "نوبت جدید", matches: [] };

const MONEY_TABS: PanelNavTab[] = [
  { href: D.FINANCE, label: "صندوق و پرداخت" },
  { href: D.PAYOUTS, label: "تسویه پرسنل" },
  { href: D.REPORTS, label: "گزارش عملکرد" },
];

/** Owner panel: daily work up front, everything salon-setup behind «سالن». */
const OWNER_NAV: PanelNavItem[] = [
  { ...APPOINTMENTS, matches: [D.BASE, D.MY_APPOINTMENTS] },
  CUSTOMERS,
  BOOK,
  {
    id: "money",
    label: "مالی",
    href: D.FINANCE,
    matches: MONEY_TABS.map((t) => t.href),
    tabs: MONEY_TABS,
  },
  {
    id: "salon",
    label: "سالن",
    href: D.SALON,
    matches: [D.SALON, D.CATALOG, D.STAFF, D.SCHEDULES],
  },
];

/** Staff panel: only what the backend lets Staff do — own work, customers, own schedule. */
const STAFF_NAV: PanelNavItem[] = [
  APPOINTMENTS,
  CUSTOMERS,
  BOOK,
  {
    id: "me",
    label: "من",
    href: D.ME,
    matches: [D.ME, D.MY_APPOINTMENTS, D.SCHEDULES],
  },
];

export function getPanelNav(isStaff: boolean): PanelNavItem[] {
  return isStaff ? STAFF_NAV : OWNER_NAV;
}

function normalizePath(pathname: string): string {
  const clean = pathname.split("?")[0].replace(/\/$/, "");
  return clean || "/";
}

/** A route is active on its own path and on its sub-routes (e.g. `/dashboard/customers/{id}`). */
export function isPanelPathActive(href: string, pathname: string): boolean {
  const path = normalizePath(pathname);
  if (href === D.BASE) return path === D.BASE;
  return path === href || path.startsWith(`${href}/`);
}

export function isPanelNavItemActive(item: PanelNavItem, pathname: string): boolean {
  return item.matches.some((href) => isPanelPathActive(href, pathname));
}

export function getActivePanelNavItem(
  items: PanelNavItem[],
  pathname: string
): PanelNavItem | null {
  return items.find((item) => isPanelNavItemActive(item, pathname)) ?? null;
}
