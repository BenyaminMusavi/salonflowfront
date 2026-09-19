"use client";

import { Input } from "@/shared/components/primitives/input/Input";
import { Label } from "@/shared/components/primitives/label/Label";

export interface ContactSocialValues {
  instagramHandle: string;
  whatsappNumber: string;
  websiteUrl: string;
}

interface ContactSocialSectionProps {
  values: ContactSocialValues;
  onChange: (values: ContactSocialValues) => void;
}

/**
 * Field group only — no card wrapper, heading, or save button. Rendered together
 * with BasicInfoSection inside one "اطلاعات پایه و تماس" card in SalonInfoView,
 * since both are persisted through the same save call.
 */
export default function ContactSocialSection({
  values,
  onChange,
}: ContactSocialSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-foreground-muted">
        تماس و شبکه‌ها
      </p>
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
    </div>
  );
}
