import { OwnerOnly } from "../_components/OwnerOnly";
import StaffServicesView from "./StaffServicesView";

export default function DashboardStaffServicesPage() {
  return (
    <OwnerOnly>
      <StaffServicesView />
    </OwnerOnly>
  );
}

