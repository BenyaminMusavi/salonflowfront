"use client";

import { useState } from "react";
import { useQuerySalonById } from "@/services/domains/salons/hooks";

interface Props {
  salonId: number;
}

export default function SalonSidebarSection({ salonId }: Props) {
  const { data, isLoading } = useQuerySalonById(salonId);
  const [expanded, setExpanded] = useState(false);

  const salon = data?.data;

  if (isLoading) {
    return (
      <div className="w-full bg-white border rounded-2xl p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="w-full bg-white border rounded-2xl p-4 text-sm text-gray-500">
        اطلاعات سالن یافت نشد
      </div>
    );
  }

  return (
    <aside className="w-full flex flex-col">
      <div className="sticky top-24 bg-white border rounded-2xl overflow-hidden shadow-sm h-[calc(100vh-6rem)] flex flex-col">

        {/* Cover */}
        <div className="relative h-[140px] w-full">
          <img
            src={salon.coverImageUrl || "/placeholder.jpg"}
            className="w-full h-full object-cover"
          />

          {/* Logo – چون DTO نداره حذف شد */}
        </div>

        {/* Content */}
        <div className="pt-6 p-5 space-y-4 overflow-y-auto">

          {/* Name */}
          <h2 className="text-lg font-bold text-gray-900">
            {salon.name}
          </h2>

          {/* Description */}
          {salon.description && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {expanded
                ? salon.description
                : salon.description.slice(0, 120)}

              {salon.description.length > 120 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="ml-2 text-blue-600 text-sm font-medium"
                >
                  {expanded ? "کمتر" : "بیشتر"}
                </button>
              )}
            </p>
          )}

          <div className="border-t" />

          {/* Info */}
          <div className="space-y-2 text-sm text-gray-600">
            {salon.phone && <div>📞 {salon.phone}</div>}
            {salon.whatsappNumber && <div>💬 {salon.whatsappNumber}</div>}
            {salon.instagramHandle && <div>📷 @{salon.instagramHandle}</div>}
            {salon.address && <div>📍 {salon.address}</div>}
            {salon.websiteUrl && (
              <div>
                🌐{" "}
                <a
                  href={salon.websiteUrl}
                  target="_blank"
                  className="text-blue-600"
                >
                  وب‌سایت
                </a>
              </div>
            )}
          </div>

        </div>
      </div>
    </aside>
  );
}
