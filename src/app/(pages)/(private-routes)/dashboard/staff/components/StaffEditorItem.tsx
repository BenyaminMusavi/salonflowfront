"use client";

import { Input } from "@/shared/components/primitives/input/Input";
import { Label } from "@/shared/components/primitives/label/Label";
import { Button } from "@/shared/components/primitives/button/Button";
import { Checkbox } from "@/shared/components/primitives/checkbox/Checkbox";
import type { ISalonBranch } from "@/services/domains/salons/types/booking-browse.type";
import type { ISalonServiceSummary } from "@/services/domains/salons/types/salon.type";
import type { TStaffRosterFieldErrors } from "./staffRosterValidation";

export interface StaffEditorValues {
  /** Existing StaffMember Guid; null for newly added rows. */
  publicId: string | null;
  /** Local React key only — not sent to the API. */
  clientKey: string;
  isCreator: boolean;
  branchPublicId: string;
  phoneNumber: string;
  offeringPublicIds: string[];
}

export const createEmptyStaff = (): StaffEditorValues => ({
  publicId: null,
  clientKey:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `staff-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  isCreator: false,
  branchPublicId: "",
  phoneNumber: "",
  offeringPublicIds: [],
});

interface StaffEditorItemProps {
  index: number;
  values: StaffEditorValues;
  branches: ISalonBranch[];
  services: ISalonServiceSummary[];
  ownerPhone?: string | null;
  statusLabel?: string | null;
  errors?: TStaffRosterFieldErrors;
  onChange: (values: StaffEditorValues) => void;
  onRemove: () => void;
}

export default function StaffEditorItem({
  index,
  values,
  branches,
  services,
  ownerPhone,
  statusLabel,
  errors,
  onChange,
  onRemove,
}: StaffEditorItemProps) {
  const update = (patch: Partial<StaffEditorValues>) =>
    onChange({ ...values, ...patch });

  const toggleOffering = (offeringPublicId: string) => {
    const has = values.offeringPublicIds.includes(offeringPublicId);
    update({
      offeringPublicIds: has
        ? values.offeringPublicIds.filter((id) => id !== offeringPublicId)
        : [...values.offeringPublicIds, offeringPublicId],
    });
  };

  return (
    <div className="rounded-[16px] border border-border bg-background-elevated p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-foreground">
            {values.isCreator ? "شما (مالک سالن)" : `پرسنل ${index + 1}`}
          </p>
          {statusLabel && (
            <p className="text-[11px] text-foreground-muted">{statusLabel}</p>
          )}
        </div>
        {!values.isCreator && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-error"
          >
            حذف
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1.5">
          <Label>شماره موبایل</Label>
          <Input
            type="tel"
            placeholder="09xxxxxxxxx"
            value={values.isCreator ? ownerPhone || "" : values.phoneNumber}
            onChange={(e) => update({ phoneNumber: e.target.value })}
            disabled={values.isCreator}
            dir="ltr"
            className="text-left"
            hasError={!!errors?.phoneNumber}
          />
          {errors?.phoneNumber && (
            <p className="text-xs font-medium text-error">{errors.phoneNumber}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>شعبه</Label>
          <select
            className="h-12 rounded-[2px] bg-foreground/5 px-3 text-sm text-foreground"
            value={values.branchPublicId}
            onChange={(e) => update({ branchPublicId: e.target.value })}
          >
            <option value="">انتخاب شعبه</option>
            {branches.map((branch) => (
              <option key={branch.publicId} value={branch.publicId}>
                {branch.name}
              </option>
            ))}
          </select>
          {errors?.branchPublicId && (
            <p className="text-xs font-medium text-error">{errors.branchPublicId}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>خدمات قابل ارائه</Label>
          <div className="flex flex-col gap-2 rounded-[12px] border border-border bg-surface p-2">
            {services.length === 0 ? (
              <p className="text-xs text-foreground-muted">
                ابتدا خدمات سالن را در «کاتالوگ» ذخیره کنید.
              </p>
            ) : (
              services.map((service) => {
                const id = service.offeringPublicId;
                if (!id) return null;
                return (
                  <label
                    key={id}
                    className="flex cursor-pointer items-center gap-2.5"
                  >
                    <Checkbox
                      checked={values.offeringPublicIds.includes(id)}
                      onCheckedChange={() => toggleOffering(id)}
                    />
                    <span className="text-sm text-foreground">{service.name}</span>
                  </label>
                );
              })
            )}
          </div>
          {errors?.offeringPublicIds && (
            <p className="text-xs font-medium text-error">
              {errors.offeringPublicIds}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
