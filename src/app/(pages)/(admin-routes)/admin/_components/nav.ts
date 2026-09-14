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
  { id: "salons-pending", label: "تایید سالن‌های جدید", href: null, icon: StorefrontIcon },
  { id: "salons", label: "مدیریت و تعلیق سالن‌ها", href: null, icon: BuildingsIcon },
  { id: "reviews", label: "نظرات و پاسخ‌ها", href: null, icon: ChatCircleTextIcon },
  { id: "reports", label: "گزارش‌های سوءرفتار", href: null, icon: WarningIcon },
  { id: "users", label: "کاربران و دسترسی‌ها", href: null, icon: UsersIcon },
  { id: "subscriptions", label: "اشتراک و صورتحساب", href: null, icon: CreditCardIcon },
  { id: "platform-reports", label: "گزارش‌های پلتفرم", href: null, icon: ChartBarIcon },
];
