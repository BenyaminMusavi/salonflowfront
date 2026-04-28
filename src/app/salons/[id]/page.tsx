import SalonSidebarSection from "./components/SalonSidebarSection";
import { StaffSelectorWrapper } from "./components/StaffSelectorWrapper";
import { ServiceSelectorWrapper } from "./components/ServiceSelectorWrapper";

export default async function SalonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const salonId = Number(id);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-7xl px-6 mt-10 flex gap-8 items-stretch">

        {/* Booking Section */}
        <div className="flex-1 bg-white border rounded-2xl overflow-hidden">

          {/* TOP STEP AREA */}
          <div className="flex flex-col gap-6 p-6 border-b">

            <StaffSelectorWrapper salonId={salonId} />

          </div>

          {/* MAIN SERVICES AREA */}
          <div className="p-6">
            <ServiceSelectorWrapper salonId={salonId} />
          </div>

          {/* NEXT STEP */}
          <div className="border-t p-6 text-sm text-gray-500">
            انتخاب سرویس → انتخاب کارمند → انتخاب زمان
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