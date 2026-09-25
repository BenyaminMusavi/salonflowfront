"use client";

import { CheckCircleIcon, CircleNotchIcon, XCircleIcon } from "@phosphor-icons/react";
import { Input } from "@/shared/components/primitives/input/Input";
import { Label } from "@/shared/components/primitives/label/Label";
import { useDebouncedValue } from "@/shared/hooks";
import { useSalonShareLink } from "@/shared/utils/salonShareLink";
import { useQueryUsernameAvailability } from "@/services/domains/salons/hooks/useQueryUsernameAvailability";
import type { IUsernameAvailability } from "@/services/domains/salons/types/onboarding.type";

const REASON_TEXT: Record<NonNullable<IUsernameAvailability["reason"]>, string> = {
  invalid: "فرمت آدرس نامعتبر است",
  reserved: "این آدرس رزرو شده است",
  taken: "این آدرس قبلاً استفاده شده است",
};

interface SalonUsernameFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  /** Edit mode: lets the salon's own current/previous usernames count as free. Omit on create. */
  salonPublicId?: string | null;
  /** Saved username — no availability call while the field still holds it. */
  currentUsername?: string | null;
  /** Field error from the last save (server 400 on `username`) or a client required-check. */
  error?: string;
  /** Extra note under the field (e.g. the 30-day change warning on an approved salon). */
  note?: string;
}

/**
 * «آدرس اختصاصی» input: lowercases while typing, previews the public link, and live-checks
 * availability (debounced). The client check is only guidance — the save call is authoritative.
 */
export default function SalonUsernameField({
  id = "salon-username",
  value,
  onChange,
  salonPublicId,
  currentUsername,
  error,
  note,
}: SalonUsernameFieldProps) {
  const trimmed = value.trim();
  const debounced = useDebouncedValue(trimmed, 400);
  const isCurrent = !!currentUsername && debounced === currentUsername;
  const { display } = useSalonShareLink(trimmed || null);

  const availability = useQueryUsernameAvailability(
    debounced,
    salonPublicId,
    !isCurrent
  );
  const result = availability.data?.data;
  const settled = debounced === trimmed && !isCurrent && !!trimmed;

  let status: React.ReactNode = null;
  if (settled && availability.isFetching) {
    status = (
      <span className="flex items-center gap-1 text-foreground-muted">
        <CircleNotchIcon size={14} className="animate-spin" /> در حال بررسی…
      </span>
    );
  } else if (settled && result && result.username === debounced) {
    status = result.available ? (
      <span className="flex items-center gap-1 text-primary">
        <CheckCircleIcon size={14} weight="fill" /> این آدرس آزاد است
      </span>
    ) : (
      <span className="flex items-center gap-1 text-content-error">
        <XCircleIcon size={14} weight="fill" />
        {REASON_TEXT[result.reason ?? "invalid"]}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>آدرس اختصاصی سالن *</Label>
      <Input
        id={id}
        dir="ltr"
        className="text-left"
        placeholder="nazanin-beauty"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        value={value}
        hasError={!!error}
        aria-invalid={!!error}
        onChange={(e) => onChange(e.target.value.toLowerCase())}
      />
      {display && (
        <p dir="ltr" className="break-all text-left text-xs text-foreground-muted">
          {display}
        </p>
      )}
      {error ? (
        <p className="text-xs text-content-error">{error}</p>
      ) : (
        status && <div className="text-xs">{status}</div>
      )}
      <p className="text-xs text-foreground-muted">
        ۳ تا ۳۰ کاراکتر؛ فقط حروف کوچک انگلیسی، عدد و خط تیره.
      </p>
      {note && <p className="text-xs text-warning">{note}</p>}
    </div>
  );
}
