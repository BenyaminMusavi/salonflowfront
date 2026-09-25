"use client";

import DatePicker from "@/shared/components/composites/date-picker/DatePicker";
import { formatDateToGregorian } from "@/shared/components/composites/date-picker/DatePickerFormField";
import moment from "moment-jalaali";
import { addDaysYmd, formatSalonDate, salonTodayYmd, ymdToDate } from "@/shared/utils/salonTime";

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
  return addDaysYmd(date, days);
}

export function formatJalaliDayLabel(date: string): string {
  try {
    return formatSalonDate(ymdToDate(date), {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  } catch {
    return date;
  }
}

/** Today on the salon (Tehran) calendar — not the device's. */
export function todayGregorian(): string {
  return salonTodayYmd();
}
