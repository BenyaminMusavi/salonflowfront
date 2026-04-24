"use client";

import * as React from "react";
import {
  useController,
  Control,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { TextArea, TextAreaProps } from "./TextArea";
import { cn } from "@/shared/utils/className";
import { Label } from "@/shared/components/primitives/label/Label";
import { AnimatePresence, motion } from "motion/react";

type TextAreaReactHookFormProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  textAreaClassName?: string;
  inputWrapperClassname?: string;
} & Omit<TextAreaProps, "name" | "defaultValue">;

export function TextAreaReactHookForm<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  className,
  textAreaClassName,
  startIcon,
  startIconClassName,
  inputWrapperClassname,
  ...props
}: TextAreaReactHookFormProps<TFieldValues>) {
  const { field, fieldState } = useController({
    name,
    control,
  });

  return (
    <div className={cn("flex flex-col w-full items-start gap-1", className)}>
      {label && (
        <Label
          className={"ms-2 text-content-primary text-sm font-medium"}
          htmlFor={field.name}
        >
          {label}
        </Label>
      )}

      <TextArea
        id={field.name}
        hasError={!!fieldState.error?.message}
        className={textAreaClassName}
        startIcon={startIcon}
        inputWrapperClassname={inputWrapperClassname}
        startIconClassName={startIconClassName}
        {...props}
        {...field}
      />

      <AnimatePresence mode="wait">
        {fieldState.error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="mt-1"
          >
            <p className="text-xs font-medium text-surface-error-fill ms-2">
              {fieldState.error.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
