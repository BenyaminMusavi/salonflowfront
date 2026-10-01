import { OwnerOnly } from "../_components/OwnerOnly";
import PayoutsView from "./PayoutsView";

export default function DashboardPayoutsPage() {
  return (
    <OwnerOnly>
      <PayoutsView />
    </OwnerOnly>
  );
}

