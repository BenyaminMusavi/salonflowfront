"use client";

import * as React from "react";
import {
  useController,
  Control,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { Input, InputProps } from "./Input";
import { cn } from "@/shared/utils/className";
import { AnimatePresence, motion } from "motion/react";
import { Label } from "@/shared/components/primitives/label/Label";

// Define props for the new component, including RHF's Control and Name
type InputReactHookFormProps<TFieldValues extends FieldValues> = {
  /**
   * The `control` object from `useForm`.
   */
  control: Control<TFieldValues>;
  /**
   * A unique name for the input field.
   */
  name: FieldPath<TFieldValues>;
  /**
   * The text label to display above the input.
   */
  label?: string;

  inputClassName?: string;

  inputWrapperClassname?: string;

} & Omit<InputProps, "name" | "defaultValue">; // Omit props handled by RHF

/**
 * A custom input component integrated with React Hook Form using the `useController` hook.
 * It combines a label, the animated input, and an error message into one reusable component.
 */
export function InputReactHookForm<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  className,
  inputClassName,
  startIcon,
  endIcon,
  startIconClassName,
  endIconClassName,
  endIconClickable,
  onEndIconClick,
                                                                       inputWrapperClassname,
  ...props
}: InputReactHookFormProps<TFieldValues>) {
  // The useController hook does all the magic!
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
      <Input
        id={field.name}
        hasError={!!fieldState.error?.message}
        className={inputClassName}
        startIcon={startIcon}
        endIcon={endIcon}
        inputWrapperClassname={inputWrapperClassname}
        startIconClassName={startIconClassName}
        endIconClassName={endIconClassName}
        endIconClickable={endIconClickable}
        onEndIconClick={onEndIconClick}
        {...props} // Pass through any other input props (placeholder, type, etc.)
        {...field} // Spread the RHF props (onChange, onBlur, value, ref)
      />

      <AnimatePresence mode="wait">
        {fieldState.error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="mt-2"
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
