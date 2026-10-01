import { OwnerOnly } from "../_components/OwnerOnly";
import SalonHubView from "./SalonHubView";

export default function DashboardSalonPage() {
  return (
    <OwnerOnly>
      <SalonHubView />
    </OwnerOnly>
  );
}
