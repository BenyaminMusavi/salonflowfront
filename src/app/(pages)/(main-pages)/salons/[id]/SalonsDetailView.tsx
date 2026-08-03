"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { WarningCircleIcon } from "@phosphor-icons/react";
import SalonsDetailHero from "./components/salons-details-hero/SalonsDetailHero";
import SalonsDetailInfo from "./components/salons-details-info/SalonsDetailInfo";
import SalonsDetailActionButtons from "./components/salons-details-action-buttons/SalonsDetailActionButtons";
import SalonReviewsSection from "./components/salon-reviews-section/SalonReviewsSection";
import ReportSalonSheet from "./components/report-salon-sheet/ReportSalonSheet";
import TopNavigation from "@/shared/components/composites/layout/top-navigation/TopNavigation";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { resolveNumericSalonId } from "@/services/domains/salons/types/salon.type";
import { useToggleFavorite } from "@/services/domains/favorites/hooks/useToggleFavorite";
import { RouteAddress } from "@/shared/data/routeAddress";

export default function SalonsDetailView() {
  const params = useParams<{ id: string }>();
  const salonPublicId = params?.id;
  const [reportOpen, setReportOpen] = useState(false);

  const { data, isLoading, isError } = useQuerySalonById(salonPublicId);
  const salon = data?.data;

  const numericSalonId = salon ? resolveNumericSalonId(salon) : undefined;
  const { isFavorite, canToggle, isPending, toggle } =
    useToggleFavorite(numericSalonId);

  if (isLoading) {
    return (
      <div className="-mt-20 flex flex-col pb-32">
        <TopNavigation>جزئیات</TopNavigation>
        <div className="flex h-[40vh] items-center justify-center text-sm text-foreground-muted">
          در حال بارگذاری…
        </div>
      </div>
    );
  }

  if (isError || !salon) {
    return (
      <div className="-mt-20 flex flex-col pb-32">
        <TopNavigation>جزئیات</TopNavigation>
        <div className="flex h-[40vh] items-center justify-center px-safe-area text-center text-sm text-error">
          سالن یافت نشد یا در کاتالوگ عمومی در دسترس نیست.
        </div>
      </div>
    );
  }

  return (
    <div className="-mt-20 flex flex-col pb-32">
      <TopNavigation>جزئیات</TopNavigation>
      <SalonsDetailHero salon={salon} />
      <SalonsDetailInfo
        salon={salon}
        isFavorite={isFavorite}
        canFavorite={canToggle}
        favoritePending={isPending}
        onToggleFavorite={toggle}
      />
      <SalonsDetailActionButtons
        whatsappNumber={salon.whatsappNumber}
        phone={salon.phone}
        websiteUrl={salon.websiteUrl}
      />

      {numericSalonId != null && (
        <div className="mt-4 px-safe-area">
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-surface-tertiary py-3 text-sm font-medium text-error"
          >
            <WarningCircleIcon size={18} />
            گزارش سالن
          </button>
        </div>
      )}

      <SalonReviewsSection salonId={numericSalonId} />

      {numericSalonId != null && (
        <ReportSalonSheet
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          salonId={numericSalonId}
        />
      )}

      <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-center p-4">
        <Link
          href={RouteAddress.SALONS.BOOK(salon.id)}
          className="block w-full max-w-[600px] rounded-[30px] bg-primary py-4 text-center text-base font-bold text-primary-foreground"
        >
          رزرو نوبت
        </Link>
      </div>
    </div>
  );
}
