"use client";

import { useState } from "react";
import { Input } from "@/shared/components/primitives/input/Input";
import { TextArea } from "@/shared/components/primitives/textArea/TextArea";
import { Label } from "@/shared/components/primitives/label/Label";

export default function BasicInfoSection() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <section
      id="salon-basic"
      className="scroll-mt-14 rounded-lg bg-surface-secondary p-3"
    >
      <h2 className="mb-3 text-sm font-bold text-foreground">اطلاعات پایه</h2>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="salon-name">نام سالن *</Label>
          <Input
            id="salon-name"
            placeholder="مثلاً سالن زیبایی ونک"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="salon-description">توضیحات</Label>
          <TextArea
            id="salon-description"
            rows={4}
            placeholder="توضیح کوتاه درباره سالن…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <p className="text-xs text-foreground-muted">
            این متن در صفحه عمومی سالن برای مشتریان نمایش داده می‌شود.
          </p>
        </div>
      </div>
    </section>
  );
}
