"use client";

import { useState } from "react";
import { WarningCircleIcon } from "@phosphor-icons/react";
import SalonsDetailHero from "./components/salons-details-hero/SalonsDetailHero";
import SalonsDetailIdentity from "./components/salons-details-identity/SalonsDetailIdentity";
import SalonsDetailTrustRow from "./components/salons-details-trust-row/SalonsDetailTrustRow";
import SalonsDetailDescription from "./components/salons-details-description/SalonsDetailDescription";
import SalonsDetailSocialStrip from "./components/salons-details-social-strip/SalonsDetailSocialStrip";
import SalonsDetailServices from "./components/salons-details-services/SalonsDetailServices";
import SalonsDetailHours from "./components/salons-details-hours/SalonsDetailHours";
import SalonsDetailStickyCta from "./components/salons-details-sticky-cta/SalonsDetailStickyCta";
import SalonReviewsSection from "./components/salon-reviews-section/SalonReviewsSection";
import ReportSalonSheet from "./components/report-salon-sheet/ReportSalonSheet";
import TopNavigation from "@/shared/components/composites/layout/top-navigation/TopNavigation";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { useToggleFavorite } from "@/services/domains/favorites/hooks/useToggleFavorite";
import { getOpenStatusLabel } from "./utils/workingHours";
import { useParams } from "next/navigation";
import { RouteAddress } from "@/shared/data/routeAddress";

export default function SalonsDetailView() {
  const params = useParams<{ id: string }>();
  const salonPublicId = params?.id;
  const [reportOpen, setReportOpen] = useState(false);

  const { data, isLoading, isError } = useQuerySalonById(salonPublicId);
  const salon = data?.data;

  const numericSalonId = salon?.salonId;
  const { isFavorite, canToggle, isPending, toggle } =
    useToggleFavorite(salonPublicId);

  if (isLoading) {
    return (
      <div className="-mt-20 flex flex-col pb-32">
        <TopNavigation fallbackHref={RouteAddress.HOME.BASE}>جزئیات</TopNavigation>
        <div className="flex h-[40vh] items-center justify-center text-sm text-foreground-muted">
          در حال بارگذاری…
        </div>
      </div>
    );
  }

  if (isError || !salon) {
    return (
      <div className="-mt-20 flex flex-col pb-32">
        <TopNavigation fallbackHref={RouteAddress.HOME.BASE}>جزئیات</TopNavigation>
        <div className="flex h-[40vh] items-center justify-center px-safe-area text-center text-sm text-error">
          سالن یافت نشد یا در کاتالوگ عمومی در دسترس نیست.
        </div>
      </div>
    );
  }

  const location =
    [salon.city, salon.address].filter(Boolean).join("، ") || null;
  const openStatus = getOpenStatusLabel(salon.workingHours);

  return (
    <div className="-mt-20 flex flex-col pb-32">
      <TopNavigation fallbackHref={RouteAddress.HOME.BASE}>جزئیات</TopNavigation>
      <SalonsDetailHero salon={salon} />
      <div className="mt-5 flex flex-col">
        <SalonsDetailIdentity
          name={salon.name}
          rating={salon.rating}
          isFavorite={isFavorite}
          canFavorite={canToggle}
          favoritePending={isPending}
          onToggleFavorite={toggle}
        />
        <SalonsDetailTrustRow location={location} openStatus={openStatus} />
        <SalonsDetailDescription description={salon.description} />
        <SalonsDetailSocialStrip
          instagramHandle={salon.instagramHandle}
          whatsappNumber={salon.whatsappNumber}
          websiteUrl={salon.websiteUrl}
        />
        <SalonsDetailServices services={salon.services} />
        <SalonsDetailHours workingHours={salon.workingHours} />

        <SalonReviewsSection salonId={numericSalonId} />

        {numericSalonId != null && (
          <div className="mt-4 px-safe-area pb-2">
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-[16px] border border-border py-3 text-sm font-medium text-error"
            >
              <WarningCircleIcon size={18} />
              گزارش سالن
            </button>
          </div>
        )}
      </div>

      {numericSalonId != null && (
        <ReportSalonSheet
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          salonId={numericSalonId}
        />
      )}

      <SalonsDetailStickyCta salonId={salon.id} />
    </div>
  );
}
