"use client";

import ServiceSelector from "./ServiceSelector";

interface Props {
  salonId: number;
  selected: number[];
  setSelected: (ids: number[]) => void;
}

export function ServiceSelectorWrapper({
  salonId,
  selected,
  setSelected,
}: Props) {
  return (
    <ServiceSelector
      salonId={salonId}
      selected={selected}
      setSelected={setSelected}
    />
  );
}