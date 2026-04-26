import { use } from "react";
import SalonSidebarSection from "./components/SalonSidebarSection";

export default function SalonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const salonId = Number(id);

  return (
    <div className="max-w-6xl mx-auto px-4 mt-10 flex gap-6">

      <div className="flex-1">
        رزرو اینجا
      </div>

      <SalonSidebarSection salonId={salonId} />

    </div>
  );
}