"use client";

import type { ISalonBranch } from "@/services/domains/salons/types/booking-browse.type";
import AmenityIcon from "@/shared/components/composites/amenities/AmenityIcon";

interface SalonsDetailAmenitiesProps {
  /** The branch picked on the page — the same one «خدمات» prices are shown for. */
  branch?: ISalonBranch | null;
  /** More than one active branch: say which branch these amenities belong to. */
  showBranchName?: boolean;
}

/** «امکانات و رفاه» of the selected branch; nothing selected or no amenities = the section is hidden. */
export default function SalonsDetailAmenities({ branch, showBranchName = false }: SalonsDetailAmenitiesProps) {
  const amenities = branch?.amenities ?? [];
  if (!branch || !amenities.length) return null;

  return (
    <section className="mt-6 px-safe-area" aria-labelledby="salon-amenities-title">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 id="salon-amenities-title" className="text-base font-bold text-foreground">امکانات و رفاه</h2>
        {showBranchName ? <span className="text-[11px] text-foreground-muted">در شعبه‌ی {branch.name}</span> : null}
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {amenities.map((a) => (
          <li key={a.key} className="flex items-center gap-2.5 rounded-[16px] bg-surface px-3 py-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-brand text-content-brand">
              <AmenityIcon amenityKey={a.key} size={18} weight="duotone" />
            </span>
            <span className="min-w-0 text-[13px] font-semibold leading-5 text-foreground">{a.title}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
