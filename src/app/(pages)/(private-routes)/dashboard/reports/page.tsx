import { OwnerOnly } from "../_components/OwnerOnly";
import ReportsView from "./ReportsView";

export default function DashboardReportsPage() {
  return (
    <OwnerOnly>
      <ReportsView />
    </OwnerOnly>
  );
}
