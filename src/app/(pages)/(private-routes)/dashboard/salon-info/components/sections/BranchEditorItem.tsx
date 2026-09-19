"use client";

import { useState } from "react";
import { Input } from "@/shared/components/primitives/input/Input";
import { Label } from "@/shared/components/primitives/label/Label";
import { Button } from "@/shared/components/primitives/button/Button";
import { Switch } from "@/shared/components/primitives/switch/Switch";
import { GenderType } from "@/services/common/enums/domain-enums";
import { GENDER_TYPE_OPTIONS } from "@/services/domains/salons/store/useOnboardingDraftStore";

export interface BranchEditorValues {
  /** Existing branch Guid; null for newly added rows. */
  publicId: string | null;
  /** Local React key only — not sent to the API. */
  clientKey: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  genderType: GenderType;
  latitude: number | null;
  longitude: number | null;
  /** false blocks NEW bookings against this branch; existing appointments are untouched. */
  isActive: boolean;
}

export interface BranchEditorErrors {
  name?: string;
  city?: string;
  address?: string;
}

export const createEmptyBranch = (): BranchEditorValues => ({
  publicId: null,
  clientKey:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `branch-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  name: "",
  city: "",
  address: "",
  phone: "",
  genderType: GenderType.Mixed,
  latitude: null,
  longitude: null,
  isActive: true,
});

interface BranchEditorItemProps {
  index: number;
  values: BranchEditorValues;
  onChange: (values: BranchEditorValues) => void;
  onRemove: () => void;
  canRemove: boolean;
  errors?: BranchEditorErrors;
}

export default function BranchEditorItem({
  index,
  values,
  onChange,
  onRemove,
  canRemove,
  errors,
}: BranchEditorItemProps) {
  const [showCoords, setShowCoords] = useState(
    values.latitude != null || values.longitude != null
  );

  const update = (patch: Partial<BranchEditorValues>) =>
    onChange({ ...values, ...patch });

  const summary = [values.name, values.city].filter(Boolean).join(" — ");

  return (
    <div className="rounded-[16px] border border-border bg-background-elevated p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-foreground">
          شعبه {index + 1}
          {summary && (
            <span className="mr-1.5 font-normal text-foreground-muted">
              ({summary})
            </span>
          )}
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-foreground-muted">
              {values.isActive ? "فعال" : "غیرفعال"}
            </span>
            <Switch
              checked={values.isActive}
              onCheckedChange={(checked) => update({ isActive: checked })}
            />
          </div>
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
      </div>

      {!values.isActive && (
        <p className="mb-3 rounded-[12px] bg-warning-background px-3 py-2 text-xs text-warning">
          این شعبه غیرفعال است — امکان ثبت نوبت جدید برای آن وجود ندارد. نوبت‌های قبلاً ثبت‌شده دست‌نخورده می‌مانند و مشتری‌ای که قبلاً رزرو کرده به‌صورت خودکار مطلع نمی‌شود.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1.5">
          <Label>نام شعبه</Label>
          <Input
            placeholder="مثلاً ونک"
            value={values.name}
            hasError={!!errors?.name}
            onChange={(e) => update({ name: e.target.value })}
          />
          {errors?.name && (
            <p className="text-xs text-content-error">{errors.name}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>شهر</Label>
          <Input
            placeholder="تهران"
            value={values.city}
            hasError={!!errors?.city}
            onChange={(e) => update({ city: e.target.value })}
          />
          {errors?.city && (
            <p className="text-xs text-content-error">{errors.city}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>آدرس</Label>
          <Input
            placeholder="خیابان، پلاک…"
            value={values.address}
            hasError={!!errors?.address}
            onChange={(e) => update({ address: e.target.value })}
          />
          {errors?.address && (
            <p className="text-xs text-content-error">{errors.address}</p>
          )}
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
            onChange={(e) =>
              update({ genderType: Number(e.target.value) as GenderType })
            }
          >
            {GENDER_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {showCoords ? (
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1.5">
              <Label>عرض جغرافیایی</Label>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="35.7219"
                value={values.latitude ?? ""}
                onChange={(e) =>
                  update({
                    latitude:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                dir="ltr"
                className="text-left"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>طول جغرافیایی</Label>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="51.3347"
                value={values.longitude ?? ""}
                onChange={(e) =>
                  update({
                    longitude:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                dir="ltr"
                className="text-left"
              />
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-fit text-primary"
            onClick={() => setShowCoords(true)}
          >
            + افزودن مختصات روی نقشه (اختیاری)
          </Button>
        )}
      </div>
    </div>
  );
}
