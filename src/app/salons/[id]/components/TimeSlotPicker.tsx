"use client";

import { useMemo } from "react";
import { useQueryAvailableSlots } from "@/services/domains/booking/hooks/useQueryAvailableSlots";
import { TimeSlotDto } from "@/services/domains/booking/types/booking.type";

interface Props {
  salonId?: number;
  staffId?: number | null;
  offeringIds?: number[];
  date?: string;

  selectedSlot: TimeSlotDto | null;
  setSelectedSlot: (slot: TimeSlotDto | null) => void;
}

export default function TimeSlotPicker({
  salonId,
  staffId,
  offeringIds,
  date,
  selectedSlot,
  setSelectedSlot,
}: Props) {
  
  // 🔥 FIX اصلی: اگر دیتا ناقص بود اصلاً چیزی render نکن
  if (!salonId || !date || !offeringIds?.length) {
    return null;
  }
  
  const { data, isLoading } = useQueryAvailableSlots({
    salonId,
    staffId,
    offeringIds,
    date,
  });

  const slots: TimeSlotDto[] = data?.data ?? [];

  const groupedSlots = useMemo(() => slots, [slots]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!slots.length) {
    return (
      <div className="text-sm text-gray-500 py-6 text-center">
        برای این تاریخ هیچ تایم آزادی وجود ندارد
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500">انتخاب ساعت</div>

      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {groupedSlots.map((slot, index) => {
          const isSelected =
            selectedSlot?.start === slot.start &&
            selectedSlot?.end === slot.end;

          return (
            <button
              key={index}
              disabled={!slot.isAvailable}
              onClick={() =>
                setSelectedSlot(isSelected ? null : slot)
              }
              className={`
                h-12 rounded-xl text-sm font-medium transition border
                ${
                  !slot.isAvailable
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : isSelected
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600"
                }
              `}
            >
              {slot.start} - {slot.end}
            </button>
          );
        })}
      </div>
    </div>
  );
}