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

export function DashboardDateField({
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

export function shiftGregorianDate(date: string, days: number): string {
  const next = new Date(`${date}T12:00:00`);
  next.setDate(next.getDate() + days);
  const y = next.getFullYear();
  const m = `${next.getMonth() + 1}`.padStart(2, "0");
  const d = `${next.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatJalaliDayLabel(date: string): string {
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString("fa-IR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  } catch {
    return date;
  }
}

export function todayGregorian(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, "0");
  const d = `${now.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}
