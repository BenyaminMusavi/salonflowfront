"use client";

import * as React from "react";
import {
  Control,
  FieldPath,
  FieldValues,
  useController,
} from "react-hook-form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "./InputOtp";
import { cn } from "@/shared/utils/className";
import { Label } from "../label/Label";

type InputOtpReactHookFormProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  length?: number;
  className?: string;
};

export function InputOtpReactHookForm<TFieldValues extends FieldValues>({
                                                                          control,
                                                                          name,
                                                                          label,
                                                                          length = 6,
                                                                          className,
                                                                        }: InputOtpReactHookFormProps<TFieldValues>) {
  const { field, fieldState } = useController({
    name,
    control,
  });

  // Handle focus when all slots are filled
  const handleComplete = React.useCallback(() => {
    // When OTP is complete, focus the last slot instead of losing focus
    const lastSlot = document.querySelector(
      `[data-otp-slot="${length - 1}"]`
    ) as HTMLElement;
    lastSlot?.focus();
  }, [length]);

  // Handle click to edit when all slots are filled
  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.hasAttribute("data-otp-slot")) {
      // If all slots are filled and user clicks any slot, allow editing
      if (field.value?.length === length) {
        // Focus the clicked slot
        target.focus();
      }
    }
  };

  return (
    <div className={cn("grid w-full gap-2", className)}>
      {label && (
        <Label className="ms-2 text-foreground-muted text-[12px]">
          {label}
        </Label>
      )}

      <div onClick={handleClick}>
        <InputOTP
          dir="ltr" // Keep dir as ltr for consistent behavior, handle RTL visually
          maxLength={length}
          value={field.value ?? ""}
          onChange={(value: string) => {
            field.onChange(value);
            if (value.length === length) {
              setTimeout(handleComplete, 100); // Small delay to ensure DOM is updated
            }
          }}
          onComplete={handleComplete}
        >
          <InputOTPGroup className="gap-x-2 w-full">
            {Array.from({ length }).map((_, index) => (
              <InputOTPSlot
                key={index}
                index={index}
                data-otp-slot={index}
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      {fieldState.error && (
        <p className="text-xs font-medium text-error">
          {fieldState.error.message}
        </p>
      )}
    </div>
  );
}