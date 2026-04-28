"use client";

import { useQueryServicesBySalon } from "@/services/domains/service-type/hooks";

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

  const services = data?.data ?? [];

  const toggle = (id: number) => {
    setSelected(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id]
    );
  };

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto py-2">
        <div className="h-20 w-40 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-20 w-40 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-20 w-40 bg-gray-200 rounded-xl animate-pulse" />
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
              min-w-[200px] p-4 rounded-xl border transition text-right
              ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "hover:border-gray-300"
              }
            `}
          >
            <div className="font-medium text-sm">{service.name}</div>

            {service.description && (
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                {service.description}
              </div>
            )}

            {service.price && (
              <div className="text-sm font-bold mt-2">
                {service.price} تومان
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}