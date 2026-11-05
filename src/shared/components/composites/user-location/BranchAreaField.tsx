"use client";

import { useState } from "react";
import { CheckCircleIcon, ListMagnifyingGlassIcon } from "@phosphor-icons/react";
import { Input } from "@/shared/components/primitives/input/Input";
import LocationPickerSheet from "./LocationPickerSheet";

/** City/district of a branch as the forms keep it. `city` is always the display text the API also requires. */
export interface IBranchAreaValue {
  city: string;
  /** Reference city (`GET /api/locations/cities`); null = text only (an older branch, or the list is not loaded yet). */
  cityPublicId: string | null;
  districtPublicId: string | null;
  districtName: string | null;
  /** Province of the reference city: the picker reopens on it (absent for older branches = starts at the province list). */
  provincePublicId?: string | null;
}

interface IBranchAreaFieldProps {
  value: IBranchAreaValue;
  onChange: (next: IBranchAreaValue) => void;
  hasError?: boolean;
}

/**
 * «شهر و محله» of a branch. Picking from the list (province → city → district) links the branch to the reference
 * data, which is what the city/district search uses. Typing keeps working exactly as before — for older branches and
 * while the location tables are still empty — and simply drops the link (the server then matches a unique city name).
 * The map pin stays in `BranchLocationField`; the server rejects a pin far from the chosen city.
 */
export default function BranchAreaField({ value, onChange, hasError }: IBranchAreaFieldProps) {
  const [open, setOpen] = useState(false);
  const linked = !!value.cityPublicId;

  return (
    <div className="flex flex-col gap-2">
      <Input
        value={value.city}
        onChange={(e) => onChange({ city: e.target.value, cityPublicId: null, districtPublicId: null, districtName: null, provincePublicId: null })}
        placeholder="تهران"
        aria-label="شهر"
        className="rounded-[12px]"
        hasError={hasError}
      />
      {linked ? (
        <p className="flex items-center gap-1.5 text-xs text-foreground">
          <CheckCircleIcon size={15} weight="fill" className="shrink-0 text-primary" />
          <span className="min-w-0 truncate">
            {value.districtName ? `محله‌ی ${value.districtName}، ${value.city}` : `${value.city} (همه‌ی محله‌ها)`}
          </span>
          <button type="button" onClick={() => setOpen(true)} className="shrink-0 font-semibold text-primary">
            تغییر
          </button>
        </p>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-primary"
        >
          <ListMagnifyingGlassIcon size={15} />
          انتخاب شهر و محله از فهرست
          <span className="font-normal text-foreground-muted">— تا در جستجوی شهر و محله دیده شوید</span>
        </button>
      )}
      <LocationPickerSheet
        open={open}
        onClose={() => setOpen(false)}
        title="شهر و محله‌ی شعبه"
        // Always this branch's own value: a half-finished choice never carries over to another branch.
        initial={linked ? { provincePublicId: value.provincePublicId, cityPublicId: value.cityPublicId, districtPublicId: value.districtPublicId } : undefined}
        onPick={(city, district) => {
          onChange({
            city: city.name,
            cityPublicId: city.publicId,
            districtPublicId: district?.publicId ?? null,
            districtName: district?.name ?? null,
            provincePublicId: city.provincePublicId,
          });
          setOpen(false);
        }}
      />
    </div>
  );
}
