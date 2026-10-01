import { OwnerOnly } from "../_components/OwnerOnly";
import FinanceView from "./FinanceView";

export default function DashboardFinancePage() {
  return (
    <OwnerOnly>
      <FinanceView />
    </OwnerOnly>
  );
}

