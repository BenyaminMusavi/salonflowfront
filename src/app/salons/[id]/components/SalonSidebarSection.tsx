"use client";

import { useQuerySalonById } from "@/services/domains/salon/hooks";

interface Props {
  salonId: number;
}

export default function SalonSidebarSection({ salonId }: Props) {
  const { data } = useQuerySalonById(salonId);

  return (
    <div className="w-[320px] bg-white border rounded-2xl p-4">
      {data?.data?.name}
    </div>
  );
}