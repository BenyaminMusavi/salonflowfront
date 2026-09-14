"use client";

import DatePicker from "@/shared/components/composites/date-picker/DatePicker";
import { formatDateToGregorian } from "@/shared/components/composites/date-picker/DatePickerFormField";
import moment from "moment-jalaali";

function toJalaliDisplay(gregorian: string): string {
  if (!gregorian) return "";
  const parsed = moment(gregorian, "YYYY-MM-DD", true);
  if (!parsed.isValid()) return "";
  return parsed.format("jYYYY/jMM/jDD");
}

export function AdminDateField({
  name,
  value,
  onChange,
  label,
  placeholder = "انتخاب تاریخ",
  className,
}: {
  name: string;
  value: string;
  onChange: (gregorian: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <DatePicker
      name={name}
      label={label}
      placeholder={placeholder}
      value={toJalaliDisplay(value)}
      onChange={(next) => onChange(next ? formatDateToGregorian(next) : "")}
      className={className}
    />
  );
}
