import { redirect } from "next/navigation";
import { RouteAddress } from "@/shared/data/routeAddress";

/** The old single «اطلاعات سالن» page is now three pages under «سالن»; keep old links working. */
export default function DashboardSalonInfoPage() {
  redirect(RouteAddress.DASHBOARD.SALON);
}
