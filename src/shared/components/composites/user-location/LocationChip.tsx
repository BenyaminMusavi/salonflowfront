"use client";

import { useState } from "react";
import { CaretDownIcon, MapPinIcon, NavigationArrowIcon } from "@phosphor-icons/react";
import { useUserLocation } from "@/services/domains/locations/hooks/useUserLocation";
import { cn } from "@/shared/utils/className";
import LocationPickerSheet from "./LocationPickerSheet";

/** «📍 سعادت‌آباد، تهران ▾» — the active location; tap to change it, use the device position or clear it. */
export default function LocationChip({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { label, mode } = useUserLocation();
  const Icon = mode === "gps" ? NavigationArrowIcon : MapPinIcon;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label ? `موقعیت: ${label}. تغییر موقعیت` : "انتخاب موقعیت"}
        className={cn(
          "inline-flex max-w-full items-center gap-1.5 rounded-full bg-background-secondary px-3 py-1.5 text-xs font-semibold text-foreground",
          className
        )}
      >
        <Icon size={15} weight="fill" className="shrink-0 text-primary" />
        <span className="truncate">{label ?? "انتخاب موقعیت"}</span>
        <CaretDownIcon size={12} className="shrink-0 text-foreground-muted" />
      </button>
      <LocationPickerSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
