"use client";

import * as React from "react";
import {
  useController,
  Control,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
} from "./Select";
import { cn } from "@/shared/utils/className";
import { Label } from "@/shared/components/primitives/label/Label";
type SelectReactHookFormProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  options: { value: string; label: string; icon?: React.ReactNode }[]; // Added icon here
} & Omit<React.ComponentPropsWithoutRef<typeof SelectTrigger>, "name" | "defaultValue">;

export function SelectReactHookForm<TFieldValues extends FieldValues>({
                                                                        control,
                                                                        name,
                                                                        label,
                                                                        options,
                                                                        className,
                                                                        placeholder = "یک گزینه را انتخاب کنید",
                                                                        ...props
                                                                      }: SelectReactHookFormProps<TFieldValues>) {
  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  // Find the selected option to get both label AND icon for the trigger
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={cn("grid w-full items-center gap-1.5", className)}>
      <Label className="ms-2 text-content-primary text-sm font-medium" htmlFor={name}>
        {label}
      </Label>

      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger
          ref={ref}
          onBlur={onBlur}
          hasError={!!error}
          icon={selectedOption?.icon} // Pass selected icon to trigger
          {...props}
        >
          <SelectValue placeholder={placeholder}>
            {selectedOption?.label}
          </SelectValue>
        </SelectTrigger>

        <SelectContent drawerLabel={label}>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              icon={option.icon} // Pass icon to each item
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && (
        <p className="ms-2 text-xs font-medium text-error">{error.message}</p>
      )}
    </div>
  );
}
