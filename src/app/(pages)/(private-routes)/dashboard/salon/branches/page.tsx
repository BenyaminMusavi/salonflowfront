import { OwnerOnly } from "../../_components/OwnerOnly";
import SalonBranchesView from "./SalonBranchesView";

export default function DashboardSalonBranchesPage() {
  return (
    <OwnerOnly>
      <SalonBranchesView />
    </OwnerOnly>
  );
}
