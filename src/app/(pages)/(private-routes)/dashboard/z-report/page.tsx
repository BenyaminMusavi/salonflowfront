import { OwnerOnly } from "../_components/OwnerOnly";
import ZReportView from "./ZReportView";

export default function DashboardZReportPage() {
  return (
    <OwnerOnly>
      <ZReportView />
    </OwnerOnly>
  );
}

