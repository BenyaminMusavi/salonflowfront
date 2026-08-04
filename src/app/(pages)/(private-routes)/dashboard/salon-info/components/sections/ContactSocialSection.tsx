"use client";

import { Input } from "@/shared/components/primitives/input/Input";
import { Label } from "@/shared/components/primitives/label/Label";
import { Button } from "@/shared/components/primitives/button/Button";

export interface ContactSocialValues {
  instagramHandle: string;
  whatsappNumber: string;
  websiteUrl: string;
}

interface ContactSocialSectionProps {
  values: ContactSocialValues;
  onChange: (values: ContactSocialValues) => void;
  onSave: () => void;
  isSaving: boolean;
  canSave: boolean;
}

export default function ContactSocialSection({
  values,
  onChange,
  onSave,
  isSaving,
  canSave,
}: ContactSocialSectionProps) {
  return (
    <section
      id="salon-contact"
      className="scroll-mt-14 rounded-lg bg-surface-secondary p-3"
    >
      <h2 className="mb-3 text-sm font-bold text-foreground">تماس و شبکه‌ها</h2>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="salon-instagram">اینستاگرام</Label>
          <Input
            id="salon-instagram"
            placeholder="بدون @"
            value={values.instagramHandle}
            onChange={(e) =>
              onChange({ ...values, instagramHandle: e.target.value })
            }
            dir="ltr"
            className="text-left"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="salon-whatsapp">واتساپ</Label>
          <Input
            id="salon-whatsapp"
            type="tel"
            placeholder="0912…"
            value={values.whatsappNumber}
            onChange={(e) =>
              onChange({ ...values, whatsappNumber: e.target.value })
            }
            dir="ltr"
            className="text-left"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="salon-website">وبسایت</Label>
          <Input
            id="salon-website"
            type="url"
            placeholder="https://"
            value={values.websiteUrl}
            onChange={(e) =>
              onChange({ ...values, websiteUrl: e.target.value })
            }
            dir="ltr"
            className="text-left"
          />
        </div>
        <Button
          type="button"
          className="mt-1 w-full"
          onClick={onSave}
          disabled={!canSave || isSaving}
          isLoading={isSaving}
        >
          ذخیره اطلاعات
        </Button>
      </div>
    </section>
  );
}
