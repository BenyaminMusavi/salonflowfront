"use client";

import { useQueryStaffBySalon } from "@/services/domains/salon/hooks/useQueryStaffBySalon";

interface Props {
  salonId: number;
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;
}

export default function StaffSelector({
  salonId,
  selectedId,
  setSelectedId,
}: Props) {
  const { data, isLoading } = useQueryStaffBySalon(salonId);

  const staffList = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto py-2">
        <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse" />
        <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse" />
        <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-3">
      {staffList.map((staff) => {
        const isSelected = selectedId === staff.id;

        return (
          <button
            key={staff.id}
            onClick={() =>
              setSelectedId(isSelected ? null : staff.id)
            }
            className="flex flex-col items-center min-w-[70px] group"
          >
            <div
              className={`
                w-16 h-16 rounded-full p-[2px] transition
                ${
                  isSelected
                    ? "ring-2 ring-blue-500 ring-offset-2"
                    : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-2"
                }
              `}
            >
              <img
                src={staff.avatarUrl || "/avatar-placeholder.png"}
                className="w-full h-full rounded-full object-cover bg-white"
              />
            </div>

            <span className="text-[12px] mt-1 text-gray-600 text-center truncate max-w-[70px]">
              {staff.fullName}
            </span>
          </button>
        );
      })}
    </div>
  );
}