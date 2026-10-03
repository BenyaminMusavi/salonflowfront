"use client";

import { useEffect, useRef, useState } from "react";
import { RouteAddress } from "@/shared/data/routeAddress";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { useMutateSalonPanel } from "@/services/domains/salon-panel/hooks";
import { DashboardPage, DashboardPageHeader } from "../../_components";
import SalonInfoSkeleton from "../../salon-info/components/SalonInfoSkeleton";
import MediaSection, {
  createEmptyMediaSlot,
  type GalleryMediaItem,
  type MediaSlotState,
} from "../../salon-info/components/sections/MediaSection";
import {
  mapSalonToBanner,
  mapSalonToCover,
  mapSalonToGallery,
  mapSalonToLogo,
} from "../../salon-info/utils/mapSalonToForm";

/** «عکس‌ها» — cover, banner, logo and gallery; each upload / delete saves at once. */
export default function SalonPhotosView() {
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const salonQuery = useQuerySalonById(salonPublicId || undefined);
  const salon = salonQuery.data?.data;
  const hydrated = useRef(false);
  const [cover, setCover] = useState<MediaSlotState>(createEmptyMediaSlot);
  const [banner, setBanner] = useState<MediaSlotState>(createEmptyMediaSlot);
  const [logo, setLogo] = useState<MediaSlotState>(createEmptyMediaSlot);
  const [gallery, setGallery] = useState<GalleryMediaItem[]>([]);
  const { orderGallery } = useMutateSalonPanel();

  useEffect(() => {
    if (!salon || hydrated.current) return;
    hydrated.current = true;
    setCover(mapSalonToCover(salon));
    setBanner(mapSalonToBanner(salon));
    setLogo(mapSalonToLogo(salon));
    setGallery(mapSalonToGallery(salon));
  }, [salon]);

  return (
    <DashboardPage className="gap-4">
      <DashboardPageHeader title="عکس‌ها" backHref={RouteAddress.DASHBOARD.SALON} />
      {!salon || !salonPublicId ? (
        <SalonInfoSkeleton />
      ) : (
        <MediaSection
          salonPublicId={salonPublicId}
          cover={cover}
          banner={banner}
          logo={logo}
          gallery={gallery}
          onCoverChange={setCover}
          onBannerChange={setBanner}
          onLogoChange={setLogo}
          onGalleryChange={setGallery}
          onGalleryReorder={async (ids) => {
            await orderGallery.mutateAsync(ids);
          }}
        />
      )}
    </DashboardPage>
  );
}
