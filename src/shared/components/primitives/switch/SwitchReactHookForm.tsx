"use client";

import * as React from "react";
import {
  useController,
  Control,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { Switch } from "./Switch";
import { cn } from "@/shared/utils/className";
import { AnimatePresence, motion } from "motion/react";
import { Label } from "@/shared/components/primitives/label/Label";

// Props
type SwitchReactHookFormProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  className?: string;
} & Omit<
  React.ComponentPropsWithoutRef<typeof Switch>,
  "checked" | "defaultChecked" | "onCheckedChange"
>;

export function SwitchReactHookForm<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  ...props
}: SwitchReactHookFormProps<TFieldValues>) {
  const { field, fieldState } = useController({
    name,
    control,
  });

  return (
    <div className={cn("flex flex-col w-full gap-2", className)}>
      <div className="flex items-center justify-between" dir="rtl">
        {/* Label Section */}
        <div className="flex flex-col items-start">
          {label && (
            <Label className="text-content-primary text-sm font-medium">
              {label}
            </Label>
          )}
          {description && (
            <span className="text-xs text-content-secondary">
              {description}
            </span>
          )}
        </div>

        {/* Switch */}
        <Switch
          checked={!!field.value}
          onCheckedChange={field.onChange}
          {...props}
        />
      </div>

      {/* Error */}
      <AnimatePresence mode="wait">
        {fieldState.error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <p className="text-xs font-medium text-surface-error-fill">
              {fieldState.error.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
