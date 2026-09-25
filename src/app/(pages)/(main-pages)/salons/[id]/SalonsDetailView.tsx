"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { useQuerySalonByUsername } from "@/services/domains/salons/hooks/useQuerySalonByUsername";
import { useToggleFavorite } from "@/services/domains/favorites/hooks/useToggleFavorite";
import { getOpenStatusLabel } from "./utils/workingHours";
import { useRouter } from "next/navigation";
import { RouteAddress } from "@/shared/data/routeAddress";

/** `/salons/{id}` loads by Guid; the public share link `/s/{username}` loads by username. */
export type SalonDetailSource = { id: string } | { username: string };

export default function SalonsDetailView({ source }: { source: SalonDetailSource }) {
  const router = useRouter();
  const requestedUsername = "username" in source ? source.username : undefined;
  const [reportOpen, setReportOpen] = useState(false);

  const byId = useQuerySalonById("id" in source ? source.id : undefined);
  const byUsername = useQuerySalonByUsername(requestedUsername);
  const { data, isLoading, isError, error } = requestedUsername ? byUsername : byId;
  const salon = data?.data;
  // API calls (favorites, booking) always use the Guid, even on the username route.
  const salonPublicId = "id" in source ? source.id : salon?.id;

  // An old username still resolves; move the address bar to the current one.
  const currentUsername = salon?.username;
  useEffect(() => {
    if (
      requestedUsername &&
      currentUsername &&
      currentUsername !== requestedUsername.toLowerCase()
    ) {
      router.replace(RouteAddress.SALONS.BY_USERNAME(currentUsername));
    }
  }, [requestedUsername, currentUsername, router]);

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
    const notFound =
      !isError || (error as { response?: { status?: number } })?.response?.status === 404;
    return (
      <div className="-mt-20 flex flex-col pb-32">
        <TopNavigation fallbackHref={RouteAddress.HOME.BASE}>جزئیات</TopNavigation>
        <div className="flex h-[40vh] flex-col items-center justify-center gap-3 px-safe-area text-center">
          <p className="text-sm text-error">
            {notFound
              ? "سالن پیدا نشد."
              : "دریافت اطلاعات سالن ناموفق بود. لطفاً دوباره تلاش کنید."}
          </p>
          <Link
            href={RouteAddress.SEARCH.BASE}
            className="text-sm font-bold text-primary"
          >
            جستجوی سالن‌ها
          </Link>
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
          username={salon.username}
          logoUrl={salon.imageUrl}
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
