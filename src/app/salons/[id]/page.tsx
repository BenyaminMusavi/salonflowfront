"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import SalonSidebarSection from "./components/SalonSidebarSection";
import StaffSelector from "./components/StaffSelector";
import ServiceSelector from "./components/ServiceSelector";
import TimeSlotPicker from "./components/TimeSlotPicker";
import { useCreateBooking } from "@/services/domains/booking/hooks/useCreateBooking";

import { TimeSlotDto } from "@/services/domains/booking/types/booking.type";

export default function SalonPage() {
  const params = useParams();

  const rawId = params?.id;

  const salonId =
    typeof rawId === "string" && !isNaN(Number(rawId))
      ? Number(rawId)
      : null;

  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotDto | null>(null);

  // مهم: برای کنترل مرحله پرسنل
  const [staffStepCompleted, setStaffStepCompleted] = useState(false);
  const { mutate, isPending } = useCreateBooking();

  useEffect(() => {
    setSelectedStaffId(undefined);
    setSelectedDate("");
    setSelectedSlot(null);
    setStaffStepCompleted(false);
  }, [selectedServices]);

  // reset تایم وقتی داده‌های وابسته تغییر می‌کنند
  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedStaffId, selectedDate]);

  if (!salonId) return null;

  const shouldShowStaff =
    selectedServices.length > 0;

  const shouldShowDate =
    selectedServices.length > 0 && staffStepCompleted;

  const isBookingReady =
    salonId &&
    selectedServices.length > 0 &&
    selectedDate.length > 0;

  const handleBooking = () => {
    if (!selectedSlot) return;

    mutate(
      {
        salonId,
        staffId: selectedStaffId ?? null,
        customerId: 1,
        offeringIds: selectedServices,
        startTime: new Date(
          `${selectedDate}T${selectedSlot.start}`
        ).toISOString(),
      },
      {
        onSuccess: () => {
          alert("رزرو با موفقیت ثبت شد");
        },

        onError: () => {
          alert("خطا در ثبت رزرو");
        },
      }
    );
  };

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
          {shouldShowStaff && (
            <div className="p-6 border-b">
              <h3 className="text-sm font-medium mb-3 text-gray-500">
                انتخاب کارمند (اختیاری)
              </h3>

              <StaffSelector
                salonId={salonId}
                offeringIds={selectedServices}
                selectedId={selectedStaffId}
                setSelectedId={(id) => {
                  setSelectedStaffId(id);
                  setStaffStepCompleted(true);
                }}
              />
            </div>
          )}

          {/* STEP 3: DATE + TIME */}
          {shouldShowDate && (
            <div className="p-6 border-b space-y-4">

              <h3 className="text-sm font-medium text-gray-500">
                انتخاب تاریخ و زمان
              </h3>

              {/* DATE */}
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border rounded-lg p-2 text-sm"
              />

              {/* TIME */}
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

              {!selectedSlot && selectedDate && (
                <div className="text-xs text-gray-400">
                  یک زمان مناسب را انتخاب کنید
                </div>
              )}

              {selectedSlot && (
                <button
                  onClick={handleBooking}
                  disabled={isPending}
                  className="
          w-full md:w-auto
          h-12 px-6 rounded-xl
          bg-blue-600 text-white
          hover:bg-blue-700
          transition
          disabled:opacity-50
        "
                >
                  {isPending
                    ? "در حال ثبت..."
                    : "ثبت رزرو"}
                </button>
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