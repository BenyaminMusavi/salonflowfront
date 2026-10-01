import { OwnerOnly } from "../_components/OwnerOnly";
import SalonInfoView from "./SalonInfoView";

export default function DashboardSalonInfoPage() {
  return (
    <OwnerOnly>
      <SalonInfoView />
    </OwnerOnly>
  );
}
