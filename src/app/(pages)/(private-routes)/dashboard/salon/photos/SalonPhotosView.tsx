"use client";

import { RouteAddress } from "@/shared/data/routeAddress";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useMutateSalonPanel } from "@/services/domains/salon-panel/hooks";
import { DashboardPage, DashboardPageHeader } from "../../_components";
import SalonInfoSkeleton from "../../salon-info/components/SalonInfoSkeleton";
import { SalonPhotosEditor } from "./SalonPhotosEditor";

/** «عکس‌ها» — cover, banner, logo and gallery; each upload / delete saves at once. */
export default function SalonPhotosView() {
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const { orderGallery } = useMutateSalonPanel();

  return (
    <DashboardPage className="gap-4">
      <DashboardPageHeader title="عکس‌ها" backHref={RouteAddress.DASHBOARD.SALON} />
      {!salonPublicId ? (
        <SalonInfoSkeleton />
      ) : (
        <SalonPhotosEditor
          salonPublicId={salonPublicId}
          onGalleryReorder={async (ids) => {
            await orderGallery.mutateAsync(ids);
          }}
        />
      )}
    </DashboardPage>
  );
}
