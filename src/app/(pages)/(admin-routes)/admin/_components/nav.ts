import {
  GaugeIcon,
  StorefrontIcon,
  BuildingsIcon,
  ChatCircleTextIcon,
  WarningIcon,
  UsersIcon,
  CreditCardIcon,
  ChartBarIcon,
  type Icon,
} from "@phosphor-icons/react";
import { RouteAddress } from "@/shared/data/routeAddress";

export type AdminNavItem = {
  id: string;
  label: string;
  /** null = page not built yet; rendered as a disabled row instead of a link. */
  href: string | null;
  icon: Icon;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { id: "dashboard", label: "داشبورد", href: RouteAddress.ADMIN.BASE, icon: GaugeIcon },
  {
    id: "salons-pending",
    label: "تایید سالن‌های جدید",
    href: RouteAddress.ADMIN.SALONS_PENDING,
    icon: StorefrontIcon,
  },
  {
    id: "salons",
    label: "مدیریت و تعلیق سالن‌ها",
    href: RouteAddress.ADMIN.SALONS,
    icon: BuildingsIcon,
  },
  {
    id: "reviews",
    label: "نظرات و پاسخ‌ها",
    href: RouteAddress.ADMIN.REVIEWS,
    icon: ChatCircleTextIcon,
  },
  {
    id: "reports",
    label: "گزارش‌های سوءرفتار",
    href: RouteAddress.ADMIN.REPORTS,
    icon: WarningIcon,
  },
  {
    id: "users",
    label: "کاربران و دسترسی‌ها",
    href: RouteAddress.ADMIN.USERS,
    icon: UsersIcon,
  },
  {
    id: "subscriptions",
    label: "اشتراک و صورتحساب",
    href: RouteAddress.ADMIN.SUBSCRIPTIONS,
    icon: CreditCardIcon,
  },
  {
    id: "platform-reports",
    label: "گزارش‌های پلتفرم",
    href: RouteAddress.ADMIN.PLATFORM_REPORTS,
    icon: ChartBarIcon,
  },
];
