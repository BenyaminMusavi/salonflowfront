import { OwnerOnly } from "../_components/OwnerOnly";
import AnalyticsView from "./AnalyticsView";

export default function DashboardAnalyticsPage() {
  return (
    <OwnerOnly>
      <AnalyticsView />
    </OwnerOnly>
  );
}
