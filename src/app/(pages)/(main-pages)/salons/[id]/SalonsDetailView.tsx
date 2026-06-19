"use client";

import { useState } from "react";
import SalonsDetailHeader
  from "@/app/(pages)/(main-pages)/salons/[id]/components/salons-details-header/SalonsDetailHeader";
import SalonsDetailHero from "./components/salons-details-hero/SalonsDetailHero";
import SalonsDetailInfo from "./components/salons-details-info/SalonsDetailInfo";
import SalonsDetailActionButtons
  from "./components/salons-details-action-buttons/SalonsDetailActionButtons";
import SalonsDetailDateSection
  from "./components/salons-details-date-section/SalonsDetailDateSection";
import SalonsDetailTimeSection
  from "./components/salons-details-time-section/SalonsDetailTimeSection";
import TopNavigation
  from "@/shared/components/composites/layout/top-navigation/TopNavigation";

export default function SalonsDetailView() {
  const [selectedDate, setSelectedDate] = useState("2026-06-21");
  const [selectedTime, setSelectedTime] = useState("");

  return (
    <div className="-mt-20 flex flex-col pb-32">
      <TopNavigation>جزئیات</TopNavigation>
      <SalonsDetailHero />
      <SalonsDetailInfo />
      <SalonsDetailActionButtons />
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
