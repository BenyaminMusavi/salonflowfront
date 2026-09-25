"use client";

import { Input } from "@/shared/components/primitives/input/Input";
import { TextArea } from "@/shared/components/primitives/textArea/TextArea";
import { Label } from "@/shared/components/primitives/label/Label";
import SalonUsernameField from "@/shared/components/composites/salon-username/SalonUsernameField";

export interface BasicInfoValues {
  name: string;
  username: string;
  description: string;
}

interface BasicInfoSectionProps {
  values: BasicInfoValues;
  onChange: (values: BasicInfoValues) => void;
  /** Shown under the name field once a save attempt exposed an invalid value. */
  nameError?: string;
  salonPublicId: string;
  /** Username as last loaded from the API — skips the availability call while unchanged. */
  savedUsername?: string | null;
  usernameError?: string;
  usernameNote?: string;
}

/**
 * Field group only — no card wrapper, heading, or save button. Rendered together
 * with ContactSocialSection inside one "اطلاعات پایه و تماس" card in
 * SalonInfoView, since both are persisted through the same save call.
 */
export default function BasicInfoSection({
  values,
  onChange,
  nameError,
  salonPublicId,
  savedUsername,
  usernameError,
  usernameNote,
}: BasicInfoSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-foreground-muted">پایه</p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="salon-name">نام سالن *</Label>
        <Input
          id="salon-name"
          placeholder="مثلاً سالن زیبایی ونک"
          value={values.name}
          hasError={!!nameError}
          aria-invalid={!!nameError}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
        />
        {nameError && (
          <p className="text-xs text-content-error">{nameError}</p>
        )}
      </div>
      <SalonUsernameField
        value={values.username}
        onChange={(username) => onChange({ ...values, username })}
        salonPublicId={salonPublicId}
        currentUsername={savedUsername}
        error={usernameError}
        note={usernameNote}
      />
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
  );
}
