"use client";

import { useQueryServicesBySalon } from "@/services/domains/service-type/hooks";

interface Service {
  id: number;
  name: string;
  description?: string;
  price?: number;
}

interface Props {
  salonId: number;
  selected: number[];
  setSelected: (ids: number[]) => void;
}

export default function ServiceSelector({
  salonId,
  selected,
  setSelected,
}: Props) {
  const { data, isLoading } = useQueryServicesBySalon(salonId);

  const services: Service[] = data?.data ?? [];

  const toggle = (id: number) => {
    setSelected(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id]
    );
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="min-w-[200px] h-[120px] rounded-xl bg-gray-200 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {services.map((service) => {
        const isSelected = selected.includes(service.id);

        return (
          <button
            key={service.id}
            onClick={() => toggle(service.id)}
            className={`
              min-w-[220px] text-right p-4 rounded-xl border transition
              flex flex-col gap-2
              ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "hover:border-gray-300"
              }
            `}
          >
            {/* Name */}
            <div className="font-medium text-sm text-gray-900">
              {service.name}
            </div>

            {/* Description */}
            {service.description && (
              <div className="text-xs text-gray-500 line-clamp-2">
                {service.description}
              </div>
            )}

            {/* Price */}
            {service.price !== undefined && (
              <div className="text-sm font-bold text-gray-800 mt-auto">
                {service.price.toLocaleString()} تومان
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}