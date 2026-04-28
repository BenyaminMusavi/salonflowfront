"use client";

import { useState } from "react";
import ServiceSelector from "./ServiceSelector";

export function ServiceSelectorWrapper({ salonId }: { salonId: number }) {
  const [selected, setSelected] = useState<number[]>([]);

  return (
    <ServiceSelector
      salonId={salonId}
      selected={selected}
      setSelected={setSelected}
    />
  );
}