"use client";

import { useQueryApprovedSalons } from "@/services/domains/salon/hooks/useQueryApprovedSalons";
import { useRouter } from "next/navigation";

export default function HomeSalonPreviewSection() {
  const { data } = useQueryApprovedSalons();
  const router = useRouter();

  const salons = data?.data?.slice(0, 15) || [];

  return (
    <div className="mt-16">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          بهترین سالن‌های زیبایی
        </h2>

        <button
          onClick={() => router.push("/salons")}
          className="text-blue-600 text-sm font-medium hover:underline"
        >
          مشاهده همه
        </button>
      </div>

      {/* Horizontal scroll row */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">

        {salons.map((salon) => (
          <div
            key={salon.id}
            onClick={() => router.push(`/salons/${salon.id}`)}
            className="
              min-w-[220px]
              bg-white
              border border-gray-100
              rounded-2xl
              overflow-hidden
              cursor-pointer
              hover:shadow-md
              transition
              flex-shrink-0
            "
          >

            {/* Image */}
            <div className="h-36 w-full overflow-hidden">
              <img
                src={salon.coverImageUrl}
                alt={salon.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-3">

              <div className="text-sm font-medium text-gray-900 truncate">
                {salon.name}
              </div>

              <div className="text-xs text-gray-500 mt-1 truncate">
                📍 {salon.address || "تهران"}
              </div>

              <div className="flex items-center justify-between mt-2">

                <span className="text-xs text-yellow-500">
                  ⭐ {salon.rating || 4.5}
                </span>

              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}