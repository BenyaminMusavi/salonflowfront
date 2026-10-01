import { OwnerOnly } from "../_components/OwnerOnly";
import StaffView from "@/app/(pages)/(private-routes)/dashboard/staff/StaffView";

export default function StaffPage() {
  return (
    <OwnerOnly>
      <StaffView />
    </OwnerOnly>
  );
}
