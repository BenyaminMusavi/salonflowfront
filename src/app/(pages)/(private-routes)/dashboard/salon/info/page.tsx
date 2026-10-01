import { OwnerOnly } from "../../_components/OwnerOnly";
import SalonProfileView from "./SalonProfileView";

export default function DashboardSalonProfilePage() {
  return (
    <OwnerOnly>
      <SalonProfileView />
    </OwnerOnly>
  );
}
