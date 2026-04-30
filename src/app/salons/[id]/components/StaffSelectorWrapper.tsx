"use client";

import StaffSelector from "./StaffSelector";

interface Props {
  salonId: number;
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;
}

export function StaffSelectorWrapper({
  salonId,
  selectedId,
  setSelectedId,
}: Props) {
  return (
    <StaffSelector
      salonId={salonId}
      selectedId={selectedId}
      setSelectedId={setSelectedId}
    />
  );
}