import { redirect } from "next/navigation";
import { RouteAddress } from "@/shared/data/routeAddress";

/** «Z-Report» is now «صندوق روز» on the finance page. */
export default function DashboardZReportPage() {
  redirect(RouteAddress.DASHBOARD.FINANCE);
}
