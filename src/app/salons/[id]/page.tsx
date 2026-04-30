"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import SalonSidebarSection from "./components/SalonSidebarSection";
import StaffSelector from "./components/StaffSelector";
import ServiceSelector from "./components/ServiceSelector";

export default function SalonPage() {
  const params = useParams();
  const salonId = Number(params.id);

  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);

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
                selectedId={selectedStaffId}
                setSelectedId={setSelectedStaffId}
              />
            </div>
          )}

          {/* STEP 3 */}
          <div className="p-6">
            {selectedServices.length === 0 ? (
              <div className="text-gray-400 text-sm">
                ابتدا سرویس مورد نظر را انتخاب کنید
              </div>
            ) : (
              <div className="text-green-600 text-sm">
                ✅ حالا مرحله بعدی: انتخاب تاریخ و ساعت
              </div>
            )}
          </div>

        </div>

        {/* Sidebar */}
        <div className="w-[340px] shrink-0 flex">
          <SalonSidebarSection salonId={salonId} />
        </div>

      </div>
    </div>
  );
}