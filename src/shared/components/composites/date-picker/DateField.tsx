"use client";

import { useState } from "react";
import { CalendarBlankIcon, XIcon } from "@phosphor-icons/react";
import { formatSalonDate, ymdToDate } from "@/shared/utils/salonTime";
import { cn } from "@/shared/utils/className";
import { MonthCalendar } from "./MonthCalendar";

function fieldLabel(ymd: string): string {
  try {
    return formatSalonDate(ymdToDate(ymd), { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  } catch {
    return ymd;
  }
}

/**
 * The one date field of the app: a labelled button that opens the in-place Jalali calendar below
 * itself. `value` / `onChange` are `yyyy-MM-dd`. When open it spans the whole row of a grid parent.
 */
export function DateField({
  id,
  label,
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  min,
  max,
  error,
  disabled,
  clearable,
  className,
}: {
  id?: string;
  label?: string;
  value: string;
  onChange: (ymd: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  error?: string | null;
  disabled?: boolean;
  /** Shows an × that clears the value (reported as `""`). */
  clearable?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("flex flex-col gap-1.5", open && "col-span-full min-w-[17rem]", className)}>
      {label ? <span className="text-xs font-semibold text-foreground-muted">{label}</span> : null}
      <div className="relative">
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex h-11 w-full items-center gap-2 rounded-[12px] border bg-input px-3 text-right text-sm disabled:opacity-50",
            error ? "border-error" : "border-input-border",
            value ? "text-foreground" : "text-foreground-muted"
          )}
        >
          <CalendarBlankIcon size={18} weight="duotone" className="shrink-0 text-foreground-muted" />
          <span className="truncate">{value ? fieldLabel(value) : placeholder}</span>
        </button>
        {clearable && value && !disabled ? (
          <button
            type="button"
            aria-label="پاک کردن تاریخ"
            onClick={() => onChange("")}
            className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-hover"
          >
            <XIcon size={14} weight="bold" />
          </button>
        ) : null}
      </div>
      {open ? (
        <MonthCalendar
          value={value}
          min={min}
          max={max}
          onChange={(d) => {
            onChange(d);
            setOpen(false);
          }}
        />
      ) : null}
      {error ? <span className="text-xs text-error">{error}</span> : null}
    </div>
  );
}
