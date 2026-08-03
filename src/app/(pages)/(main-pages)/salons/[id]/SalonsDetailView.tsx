"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import SalonsDetailHero from "./components/salons-details-hero/SalonsDetailHero";
import SalonsDetailInfo from "./components/salons-details-info/SalonsDetailInfo";
import SalonsDetailActionButtons from "./components/salons-details-action-buttons/SalonsDetailActionButtons";
import SalonsDetailDateSection from "./components/salons-details-date-section/SalonsDetailDateSection";
import SalonsDetailTimeSection from "./components/salons-details-time-section/SalonsDetailTimeSection";
import TopNavigation from "@/shared/components/composites/layout/top-navigation/TopNavigation";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { resolveNumericSalonId } from "@/services/domains/salons/types/salon.type";
import { useToggleFavorite } from "@/services/domains/favorites/hooks/useToggleFavorite";

export default function SalonsDetailView() {
  const params = useParams<{ id: string }>();
  const salonPublicId = params?.id;

  const { data, isLoading, isError } = useQuerySalonById(salonPublicId);
  const salon = data?.data;

  const numericSalonId = salon ? resolveNumericSalonId(salon) : undefined;
  const { isFavorite, canToggle, isPending, toggle } =
    useToggleFavorite(numericSalonId);

  const [selectedDate, setSelectedDate] = useState("2026-06-21");
  const [selectedTime, setSelectedTime] = useState("");

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
      <SalonsDetailDateSection
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
      <SalonsDetailTimeSection
        selectedTime={selectedTime}
        onSelectTime={setSelectedTime}
      />

      <div className="fixed bottom-0 left-0 right-0 p-4">
        <button
          type="button"
          className="w-full rounded-[30px] bg-primary py-4 text-center text-base font-bold text-primary-foreground"
        >
          رزرو نوبت
        </button>
      </div>
    </div>
  );
}
