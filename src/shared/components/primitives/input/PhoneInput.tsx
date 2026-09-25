"use client";

import * as React from "react";
import { DeviceMobileIcon, PhoneIcon } from "@phosphor-icons/react";
import { Input, type InputProps } from "./Input";
import {
  MOBILE_MAX_DIGITS,
  normalizePhoneInput,
  PHONE_INPUT_ATTRS,
} from "@/shared/utils/phoneInput";
import { cn } from "@/shared/utils/className";

export interface PhoneInputProps
  extends Omit<InputProps, "value" | "onChange" | "type" | "inputMode" | "dir"> {
  value: string | null | undefined;
  /** Latin digits only (Persian/Arabic digits converted, other characters dropped). */
  onValueChange: (value: string) => void;
  /** `mobile` (default): 11 digits + mobile icon. `landline`: longer numbers + phone icon. */
  kind?: "mobile" | "landline";
}

/**
 * Phone number field: phone keypad on mobile devices, LTR digits, a leading icon so the field is
 * recognisable once filled, and digit normalization so the value always validates server-side.
 */
const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onValueChange, kind = "mobile", className, startIcon, ...props }, ref) => {
    const Icon = kind === "mobile" ? DeviceMobileIcon : PhoneIcon;
    return (
      <Input
        ref={ref}
        autoComplete="off"
        {...props}
        type={PHONE_INPUT_ATTRS.type}
        inputMode={PHONE_INPUT_ATTRS.inputMode}
        dir={PHONE_INPUT_ATTRS.dir}
        className={cn(PHONE_INPUT_ATTRS.className, className)}
        startIcon={startIcon ?? <Icon size={20} />}
        value={value ?? ""}
        onChange={(e) =>
          onValueChange(
            normalizePhoneInput(e.target.value, kind === "mobile" ? MOBILE_MAX_DIGITS : 15)
          )
        }
      />
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
