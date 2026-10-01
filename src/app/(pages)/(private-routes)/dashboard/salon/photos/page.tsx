import { OwnerOnly } from "../../_components/OwnerOnly";
import SalonPhotosView from "./SalonPhotosView";

export default function DashboardSalonPhotosPage() {
  return (
    <OwnerOnly>
      <SalonPhotosView />
    </OwnerOnly>
  );
}
