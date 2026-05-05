"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import SalonSidebarSection from "./components/SalonSidebarSection";
import StaffSelector from "./components/StaffSelector";
import ServiceSelector from "./components/ServiceSelector";
import TimeSlotPicker from "./components/TimeSlotPicker";
import { TimeSlotDto } from "@/services/domains/booking/types/booking.type";

export default function SalonPage() {
  const params = useParams();
 const rawId = params?.id;

const salonId =
  typeof rawId === "string" && !isNaN(Number(rawId))
    ? Number(rawId)
    : null;

  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotDto | null>(null);

  const isBookingReady =
  salonId &&
  selectedServices.length > 0 &&
  selectedDate.length > 0;

  if (!salonId) {
  return null; // یا loading
}

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-7xl px-6 mt-10 flex gap-8 items-stretch">

        {/* Booking Section */}
        <div className="flex-1 bg-white border rounded-2xl overflow-hidden">

          {/* STEP 1: SERVICES */}
          <div className="p-6 border-b">
            <h3 className="text-sm font-medium mb-3 text-gray-500">
              انتخاب خدمات
            </h3>

            <ServiceSelector
              salonId={salonId}
              selected={selectedServices}
              setSelected={setSelectedServices}
            />
          </div>

          {/* STEP 2: STAFF */}
          {selectedServices.length > 0 && (
            <div className="p-6 border-b">
              <h3 className="text-sm font-medium mb-3 text-gray-500">
                انتخاب کارمند (اختیاری)
              </h3>

              <StaffSelector
              salonId={salonId}
              offeringIds={selectedServices}
              selectedId={selectedStaffId}
              setSelectedId={setSelectedStaffId}
              />

            </div>
          )}

          {selectedServices.length > 0 && (
  <div className="p-6 border-b space-y-4">

    <h3 className="text-sm font-medium text-gray-500">
      انتخاب زمان
    </h3>

    <input
      type="date"
      value={selectedDate}
      onChange={(e) => setSelectedDate(e.target.value)}
      className="border rounded-lg p-2 text-sm"
    />

    {isBookingReady && (
   <TimeSlotPicker
    salonId={salonId}
    staffId={selectedStaffId}
    offeringIds={selectedServices}
    date={selectedDate}
    selectedSlot={selectedSlot}
    setSelectedSlot={setSelectedSlot}
   />
  )}

    {/* UX hint */}
    {!selectedSlot && selectedDate && (
      <div className="text-xs text-gray-400">
        یک زمان مناسب را انتخاب کنید
      </div>
    )}

  </div>
)}

        </div>

        {/* Sidebar */}
        <div className="w-[340px] shrink-0 flex">
          <SalonSidebarSection salonId={salonId} />
        </div>

      </div>
    </div>
  );
}
