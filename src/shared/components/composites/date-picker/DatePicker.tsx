"use client";

import * as React from "react";
import { cn } from "@/shared/utils/className";
import { Label } from "@/shared/components/primitives/label/Label";
import { CalendarIcon, XIcon } from "@phosphor-icons/react";

declare global {
  interface Window {
    jalaliDatepicker: {
      startWatch: (options?: Record<string, unknown>) => void;
      show: (input: HTMLInputElement) => void;
      hide: () => void;
      updateOptions: (options?: Record<string, unknown>) => void;
    };
  }
}

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
  value?: string;
  onChange?: (value: string) => void;
  error?: string | null;
  disabled?: boolean;
  className?: string;
  hasClearButton?: boolean;
  minDate?: string;
  maxDate?: string;
}

function DatePicker(props: IDatePickerProps) {
  const {
    id,
    name,
    value = "",
    label,
    placeholder = "انتخاب تاریخ",
    onChange,
    error,
    disabled,
    className,
    hasClearButton = false,
    minDate,
    maxDate,
  } = props;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = React.useState(value);
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    const existingScript = document.querySelector(
      'script[src*="jalalidatepicker"]',
    );

    if (existingScript && window.jalaliDatepicker) {
      setIsReady(true);
      return;
    }

    if (existingScript) {
      const checkReady = setInterval(() => {
        if (window.jalaliDatepicker) {
          setIsReady(true);
          clearInterval(checkReady);
        }
      }, 100);
      return () => clearInterval(checkReady);
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://unpkg.com/@majidh1/jalalidatepicker/dist/jalalidatepicker.min.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src =
      "https://unpkg.com/@majidh1/jalalidatepicker/dist/jalalidatepicker.min.js";
    script.async = true;
    script.onload = () => {
      setIsReady(true);
    };
    document.body.appendChild(script);
  }, []);

  React.useEffect(() => {
    if (isReady && window.jalaliDatepicker && inputRef.current) {
      window.jalaliDatepicker.startWatch();
    }
  }, [isReady]);

  React.useEffect(() => {
    if (value !== internalValue) {
      setInternalValue(value);
      if (inputRef.current) {
        inputRef.current.value = value;
      }
    }
  }, [value]);

  const handleInputChange = React.useCallback(
    (e: Event) => {
      const target = e.target as HTMLInputElement;
      const newValue = target.value;
      setInternalValue(newValue);
      onChange?.(newValue);
    },
    [onChange],
  );

  React.useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    input.addEventListener("change", handleInputChange);

    return () => {
      input.removeEventListener("change", handleInputChange);
    };
  }, [handleInputChange]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setInternalValue("");
    onChange?.("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleContainerClick = () => {
    if (isReady && window.jalaliDatepicker && inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <Label className="px-4 text-sm font-medium text-content-primary">
          {label}
        </Label>
      )}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className={cn(
          "flex h-12 w-full items-center justify-between gap-2 rounded-[2px] bg-surface-tertiary px-4 py-2.5",
          "ring-1 ring-transparent hover:ring-primary focus-within:ring-2",
          error && "ring-2 ring-content-error",
          disabled && "cursor-default opacity-50",
        )}
      >
        <div className="flex items-center gap-2 flex-1">
          <CalendarIcon
            className="h-4 w-4 text-content-secondary flex-shrink-0"
            weight="duotone"
          />
          <input
            ref={inputRef}
            id={id}
            name={name}
            type="text"
            data-jdp
            data-jdp-min-date={minDate}
            data-jdp-max-date={maxDate}
            defaultValue={internalValue}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "w-full bg-transparent text-sm text-content-primary outline-none cursor-pointer",
              disabled && "cursor-default",
            )}
            style={{ caretColor: "transparent" }}
          />
        </div>
        {hasClearButton && internalValue && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center flex-shrink-0"
          >
            <XIcon className="h-4 w-4 text-primary" weight="bold" />
          </button>
        )}
      </div>
      {error && <span className="text-xs text-content-error">{error}</span>}
    </div>
  );
}

export default DatePicker;
