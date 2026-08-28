"use client";

import { PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/shared/components/primitives/button/Button";
import type { ISalonBranch } from "@/services/domains/salons/types/booking-browse.type";
import type { ISalonServiceSummary } from "@/services/domains/salons/types/salon.type";
import StaffEditorItem, {
  createEmptyStaff,
  type StaffEditorValues,
} from "./StaffEditorItem";
import type { TStaffRosterFieldErrors } from "./staffRosterValidation";

interface StaffRosterSectionProps {
  staff: StaffEditorValues[];
  branches: ISalonBranch[];
  services: ISalonServiceSummary[];
  ownerPhone?: string | null;
  statusLabelFor: (row: StaffEditorValues) => string | null;
  errors: Record<string, TStaffRosterFieldErrors>;
  onChange: (staff: StaffEditorValues[]) => void;
  onSave: () => void;
  isSaving: boolean;
}

export default function StaffRosterSection({
  staff,
  branches,
  services,
  ownerPhone,
  statusLabelFor,
  errors,
  onChange,
  onSave,
  isSaving,
}: StaffRosterSectionProps) {
  const updateStaff = (index: number, values: StaffEditorValues) => {
    onChange(staff.map((s, i) => (i === index ? values : s)));
  };

  const removeStaff = (index: number) => {
    onChange(staff.filter((_, i) => i !== index));
  };

  const addStaff = () => {
    onChange([...staff, createEmptyStaff()]);
  };

  return (
    <section className="rounded-[20px] border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-foreground">لیست پرسنل</h2>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addStaff}
          disabled={isSaving}
          className="gap-1"
        >
          <PlusIcon size={14} />
          افزودن پرسنل
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {staff.map((row, index) => (
          <StaffEditorItem
            key={row.clientKey}
            index={index}
            values={row}
            branches={branches}
            services={services}
            ownerPhone={ownerPhone}
            statusLabel={statusLabelFor(row)}
            errors={errors[row.clientKey]}
            onChange={(values) => updateStaff(index, values)}
            onRemove={() => removeStaff(index)}
          />
        ))}

        <Button
          type="button"
          className="w-full"
          onClick={onSave}
          disabled={isSaving}
          isLoading={isSaving}
        >
          ذخیره پرسنل
        </Button>
      </div>
    </section>
  );
}
