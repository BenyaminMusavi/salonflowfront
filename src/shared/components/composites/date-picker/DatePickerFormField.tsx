"use client";

import * as React from "react";
import DatePicker from "./DatePicker";
import {
  useController,
  Control,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import moment from "moment-jalaali";

export const formatDateToGregorian = (dateString: string): string => {
  if (!dateString) return "";
  const parts = dateString.split("/");
  if (parts.length !== 3) return dateString;
  const [year, month, day] = parts.map(Number);
  const persianDate = moment(`${year}-${month}-${day}`, "jYYYY-jM-jD");
  return persianDate.format("YYYY-MM-DD");
};

const parseDateFromGregorian = (dateString: string): string => {
  if (!dateString) return "";
  const gregorianDate = moment(dateString, "YYYY-MM-DD");
  return gregorianDate.format("jYYYY/jMM/jDD");
};

interface IDatePickerFormFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function DatePickerFormField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  disabled,
  className,
}: IDatePickerFormFieldProps<TFieldValues>) {
  const { field, fieldState } = useController({
    name,
    control,
  });

  const handleChange = (value: string) => {
    if (value) {
      field.onChange(formatDateToGregorian(value));
    } else {
      field.onChange("");
    }
  };

  const displayValue = field.value ? parseDateFromGregorian(field.value) : "";

  return (
    <DatePicker
      name={field.name}
      label={label}
      placeholder={placeholder}
      value={displayValue}
      onChange={handleChange}
      error={fieldState.error?.message}
      disabled={disabled}
      className={className}
    />
  );
}

export default DatePickerFormField;
