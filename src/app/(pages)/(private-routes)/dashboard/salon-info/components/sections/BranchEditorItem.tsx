"use client";

import { Input } from "@/shared/components/primitives/input/Input";
import { Label } from "@/shared/components/primitives/label/Label";
import { Button } from "@/shared/components/primitives/button/Button";
import { GENDER_TYPE_OPTIONS } from "@/services/domains/salons/store/useOnboardingDraftStore";

export interface BranchEditorValues {
  name: string;
  city: string;
  address: string;
  phone: string;
  genderType: number;
}

interface BranchEditorItemProps {
  index: number;
  values: BranchEditorValues;
  onChange: (values: BranchEditorValues) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export default function BranchEditorItem({
  index,
  values,
  onChange,
  onRemove,
  canRemove,
}: BranchEditorItemProps) {
  const update = (patch: Partial<BranchEditorValues>) =>
    onChange({ ...values, ...patch });

  return (
    <div className="rounded-[16px] bg-surface-tertiary p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-foreground">شعبه {index + 1}</p>
        {canRemove && (
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
          <Label>نام شعبه</Label>
          <Input
            placeholder="مثلاً ونک"
            value={values.name}
            onChange={(e) => update({ name: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>شهر</Label>
          <Input
            placeholder="تهران"
            value={values.city}
            onChange={(e) => update({ city: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>آدرس</Label>
          <Input
            placeholder="خیابان، پلاک…"
            value={values.address}
            onChange={(e) => update({ address: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>تلفن شعبه</Label>
          <Input
            type="tel"
            placeholder="021…"
            value={values.phone}
            onChange={(e) => update({ phone: e.target.value })}
            dir="ltr"
            className="text-left"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>نوع مخاطب</Label>
          <select
            className="h-12 rounded-[2px] bg-foreground/5 px-3 text-sm text-foreground"
            value={values.genderType}
            onChange={(e) => update({ genderType: Number(e.target.value) })}
          >
            {GENDER_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
