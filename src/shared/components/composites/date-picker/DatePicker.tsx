"use client";

import moment from "moment-jalaali";
import { DateField } from "./DateField";

export interface IDayValue {
  year: number;
  month: number;
  day: number;
}

export type DayValue = IDayValue | null;

export interface IDatePickerProps {
  id?: string;
  name: string;
  label?: string;
  placeholder?: string;
  /** Jalali `jYYYY/jMM/jDD`. */
  value?: string;
  /** Receives Jalali `jYYYY/jMM/jDD` (or `""` when cleared). */
  onChange?: (value: string) => void;
  error?: string | null;
  disabled?: boolean;
  className?: string;
  hasClearButton?: boolean;
  /** Gregorian `yyyy-MM-dd`. */
  minDate?: string;
  /** Gregorian `yyyy-MM-dd`. */
  maxDate?: string;
}

const toYmd = (jalali: string): string => {
  if (!jalali) return "";
  const parsed = moment(jalali, "jYYYY/jM/jD", true);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : "";
};

/** Jalali-string wrapper over the shared `DateField` — every date field looks and works the same. */
function DatePicker({
  id,
  label,
  placeholder,
  value = "",
  onChange,
  error,
  disabled,
  className,
  hasClearButton = false,
  minDate,
  maxDate,
}: IDatePickerProps) {
  return (
    <DateField
      id={id}
      label={label}
      placeholder={placeholder}
      value={toYmd(value)}
      onChange={(ymd) => onChange?.(ymd ? moment(ymd, "YYYY-MM-DD").format("jYYYY/jMM/jDD") : "")}
      error={error}
      disabled={disabled}
      clearable={hasClearButton}
      min={minDate}
      max={maxDate}
      className={className}
    />
  );
}

export default DatePicker;
