"use client";

import { useState } from "react";
import StaffSelector from "./StaffSelector";

export function StaffSelectorWrapper({ salonId }: { salonId: number }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <StaffSelector
      salonId={salonId}
      selectedId={selectedId}
      setSelectedId={setSelectedId}
    />
  );
}