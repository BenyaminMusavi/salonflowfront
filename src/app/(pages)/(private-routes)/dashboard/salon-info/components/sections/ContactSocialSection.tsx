"use client";

import { useState } from "react";
import { Input } from "@/shared/components/primitives/input/Input";
import { Label } from "@/shared/components/primitives/label/Label";
import { Button } from "@/shared/components/primitives/button/Button";

export default function ContactSocialSection() {
  const [instagramHandle, setInstagramHandle] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

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
            value={instagramHandle}
            onChange={(e) => setInstagramHandle(e.target.value)}
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
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
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
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            dir="ltr"
            className="text-left"
          />
        </div>
        <Button type="button" disabled className="mt-1 w-full">
          ذخیره اطلاعات
        </Button>
        <p className="text-xs text-foreground-muted">
          ذخیره اطلاعات پایه و تماس در مرحله بعد به API متصل می‌شود.
        </p>
      </div>
    </section>
  );
}
