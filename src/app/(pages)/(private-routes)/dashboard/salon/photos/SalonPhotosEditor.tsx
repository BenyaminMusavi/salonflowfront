"use client";

import { useEffect, useRef, useState } from "react";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
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

/**
 * Cover, banner, logo and gallery of one salon; every upload / delete saves at once. Shared by the
 * panel «عکس‌ها» page and onboarding (a draft salon works too). `onGalleryReorder` is optional —
 * the order endpoint lives under the panel's salon context, so onboarding leaves it out.
 */
export function SalonPhotosEditor({
  salonPublicId,
  onGalleryReorder,
}: {
  salonPublicId: string;
  onGalleryReorder?: (publicIds: string[]) => Promise<void>;
}) {
  const salonQuery = useQuerySalonById(salonPublicId);
  const salon = salonQuery.data?.data;
  const hydrated = useRef(false);
  const [cover, setCover] = useState<MediaSlotState>(createEmptyMediaSlot);
  const [banner, setBanner] = useState<MediaSlotState>(createEmptyMediaSlot);
  const [logo, setLogo] = useState<MediaSlotState>(createEmptyMediaSlot);
  const [gallery, setGallery] = useState<GalleryMediaItem[]>([]);

  useEffect(() => {
    if (!salon || hydrated.current) return;
    hydrated.current = true;
    setCover(mapSalonToCover(salon));
    setBanner(mapSalonToBanner(salon));
    setLogo(mapSalonToLogo(salon));
    setGallery(mapSalonToGallery(salon));
  }, [salon]);

  // A brand-new draft may not be readable yet — start empty rather than waiting forever.
  if (salonQuery.isLoading) return <SalonInfoSkeleton />;

  return (
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
      onGalleryReorder={onGalleryReorder}
    />
  );
}
