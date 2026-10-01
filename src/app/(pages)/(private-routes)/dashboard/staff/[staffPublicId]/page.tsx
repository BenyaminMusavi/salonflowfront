import { OwnerOnly } from "../../_components/OwnerOnly";
import StaffDetailsView from "./StaffDetailsView";

export default function StaffDetailsPage() {
  return (
    <OwnerOnly>
      <StaffDetailsView />
    </OwnerOnly>
  );
}
