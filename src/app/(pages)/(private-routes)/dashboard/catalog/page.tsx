import { OwnerOnly } from "../_components/OwnerOnly";
import CatalogView from "./CatalogView";

export default function DashboardCatalogPage() {
  return (
    <OwnerOnly>
      <CatalogView />
    </OwnerOnly>
  );
}

