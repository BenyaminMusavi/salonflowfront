"use client";

import StaffSelector from "./StaffSelector";

interface Props {
  salonId: number;
  offeringIds: number[];            
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;
}

export function StaffSelectorWrapper({
  salonId,
  offeringIds,
  selectedId,
  setSelectedId,
}: Props) {
  return (
    <StaffSelector
      salonId={salonId}
      offeringIds={offeringIds}
      selectedId={selectedId}
      setSelectedId={setSelectedId}
    />
  );
}
