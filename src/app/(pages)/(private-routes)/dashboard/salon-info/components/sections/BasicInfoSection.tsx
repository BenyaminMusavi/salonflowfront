"use client";

import { Input } from "@/shared/components/primitives/input/Input";
import { TextArea } from "@/shared/components/primitives/textArea/TextArea";
import { Label } from "@/shared/components/primitives/label/Label";

export interface BasicInfoValues {
  name: string;
  description: string;
}

interface BasicInfoSectionProps {
  values: BasicInfoValues;
  onChange: (values: BasicInfoValues) => void;
}

export default function BasicInfoSection({
  values,
  onChange,
}: BasicInfoSectionProps) {
  return (
    <section
      id="salon-basic"
      className="scroll-mt-24 rounded-[20px] border border-border bg-surface p-4"
    >
      <h2 className="mb-3 text-sm font-bold text-foreground">اطلاعات پایه</h2>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="salon-name">نام سالن *</Label>
          <Input
            id="salon-name"
            placeholder="مثلاً سالن زیبایی ونک"
            value={values.name}
            onChange={(e) => onChange({ ...values, name: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="salon-description">توضیحات</Label>
          <TextArea
            id="salon-description"
            rows={4}
            placeholder="توضیح کوتاه درباره سالن…"
            value={values.description}
            onChange={(e) =>
              onChange({ ...values, description: e.target.value })
            }
          />
          <p className="text-xs text-foreground-muted">
            این متن در صفحه عمومی سالن برای مشتریان نمایش داده می‌شود.
          </p>
        </div>
      </div>
    </section>
  );
}
