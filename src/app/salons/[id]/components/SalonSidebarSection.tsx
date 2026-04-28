"use client";

import { useState } from "react";
import { useQuerySalonById } from "@/services/domains/salon/hooks";

interface Props {
  salonId: number;
}

export default function SalonSidebarSection({ salonId }: Props) {
  const { data, isLoading } = useQuerySalonById(salonId);
  const [expanded, setExpanded] = useState(false);

  const salon = data?.data;

  if (isLoading) {
    return (
      <div className="w-[340px] bg-white border rounded-2xl p-4">
        در حال دریافت اطلاعات...
      </div>
    );
  }

  return (
<aside className="w-full flex flex-col">
<div className="sticky top-24 bg-white border rounded-2xl overflow-hidden shadow-sm h-[calc(100vh-6rem)] flex flex-col">

        {/* Cover Image */}
        <div className="relative h-[140px] w-full">
          <img
            src={salon?.coverImage || "/placeholder.jpg"}
            className="w-full h-full object-cover"
          />

          {/* Logo */}
          <div className="absolute -bottom-8 left-4">
            <img
              src={salon?.logo || "/logo-placeholder.png"}
              className="w-16 h-16 rounded-full border-4 border-white object-cover"
            />
          </div>
        </div>

        {/* Content */}
<div className="pt-10 p-5 space-y-3 overflow-y-auto">
            
          {/* Name */}
          <h2 className="text-lg font-bold">
            {salon?.name}
          </h2>

          {/* Description */}
          {salon?.description && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {expanded
                ? salon.description
                : salon.description.slice(0, 120)}
              
              {salon.description.length > 120 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="ml-2 text-blue-600 text-sm font-medium"
                >
                  {expanded ? "Show less" : "Read more"}
                </button>
              )}
            </p>
          )}

          {/* Divider */}
          <div className="border-t my-3"></div>

          {/* Info */}
          <div className="space-y-2 text-sm text-gray-600">
            {salon?.phone && <div>📞 {salon.phone}</div>}
            {salon?.whatsapp && <div>💬 WhatsApp</div>}
            {salon?.instagram && <div>📷 {salon.instagram}</div>}
            {salon?.address && <div>📍 {salon.address}</div>}
            {salon?.email && <div>✉️ {salon.email}</div>}
          </div>

        </div>
      </div>
    </aside>
  );
}
