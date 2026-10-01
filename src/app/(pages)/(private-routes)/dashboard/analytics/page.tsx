import { redirect } from "next/navigation";
import { RouteAddress } from "@/shared/data/routeAddress";

/** «تحلیل / شاخص‌ها» merged into «گزارش عملکرد». */
export default function DashboardAnalyticsPage() {
  redirect(RouteAddress.DASHBOARD.REPORTS);
}
