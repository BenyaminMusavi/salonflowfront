"use client";

import * as React from "react";
import {
  useController,
  Control,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { AnimatePresence, motion } from "motion/react";
import { Checkbox, CheckboxProps } from "./Checkbox";
import { cn } from "@/shared/utils/className";

type CheckboxReactHookFormProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: React.ReactNode;
  className?: string;
} & Omit<
  CheckboxProps,
  "checked" | "defaultChecked" | "onCheckedChange" | "name"
>;

/**
 * A checkbox bound to React Hook Form via `useController`, matching the same
 * label/error/animation conventions as `SwitchReactHookForm` and `InputReactHookForm`.
 */
export function CheckboxReactHookForm<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  className,
  ...props
}: CheckboxReactHookFormProps<TFieldValues>) {
  const { field, fieldState } = useController({ name, control });
  const errorId = fieldState.error ? `${field.name}-error` : undefined;

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div className="flex items-start gap-2.5" dir="rtl">
        <Checkbox
          id={field.name}
          name={field.name}
          checked={!!field.value}
          onCheckedChange={field.onChange}
          onBlur={field.onBlur}
          hasError={!!fieldState.error}
          aria-invalid={!!fieldState.error}
          aria-describedby={errorId}
          className="mt-0.5"
          {...props}
        />
        {label && (
          <label
            htmlFor={field.name}
            className="cursor-pointer select-none text-sm leading-6 text-foreground-muted"
          >
            {label}
          </label>
        )}
      </div>

      <AnimatePresence mode="wait">
        {fieldState.error && (
          <motion.p
            id={errorId}
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="text-xs font-medium text-error"
          >
            {fieldState.error.message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
