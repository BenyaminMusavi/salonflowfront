"use client";

import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import { cn } from "@/shared/utils/className";
import {
  DURATION_MAX,
  DURATION_MIN,
  DURATION_STEP,
  formatDuration,
  formatDurationShort,
  stepDuration,
} from "@/shared/utils/serviceDuration";

const PRESETS = [15, 30, 45, 60, 90, 120];

interface DurationPickerProps {
  /** Minutes; null only when `optional` («پیش‌فرض خدمت» = no override). */
  value: number | null;
  onChange: (minutes: number | null) => void;
  label?: string;
  /** Adds a «پیش‌فرض خدمت» choice that clears the value (custom per-staff / pricing-rule durations). */
  optional?: boolean;
}

/**
 * Service-duration input in 15-minute steps (15 min – 12 h): −/+ stepper with a readable label
 * («1 ساعت و 15 دقیقه») and one-tap presets. No keyboard, so an off-grid value can't be typed;
 * an existing off-grid value (e.g. 20) is shown with a warning and snaps on the first change.
 */
export function DurationPicker({ value, onChange, label, optional = false }: DurationPickerProps) {
  const offGrid = value != null && value % DURATION_STEP !== 0;

  const decrement = () => {
    if (value == null) return;
    if (optional && value <= DURATION_MIN) return onChange(null);
    onChange(stepDuration(value, -1));
  };
  const increment = () => onChange(value == null ? DURATION_MIN : stepDuration(value, 1));

  const canDecrement = value != null && (optional || value > DURATION_MIN || offGrid);
  const canIncrement = value == null || value < DURATION_MAX || offGrid;

  return (
    <div className="flex flex-col gap-2">
      {label ? <span className="text-sm text-foreground-muted">{label}</span> : null}

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-input-border bg-input p-1.5">
        <button
          type="button"
          onClick={increment}
          disabled={!canIncrement}
          aria-label="افزایش 15 دقیقه"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground transition hover:bg-surface-hover disabled:opacity-40"
        >
          <PlusIcon size={18} weight="bold" />
        </button>
        <span
          className={cn(
            "min-w-0 flex-1 text-center text-sm font-bold",
            value == null ? "text-foreground-muted" : "text-foreground"
          )}
          aria-live="polite"
        >
          {value == null ? "پیش‌فرض خدمت" : formatDuration(value)}
        </span>
        <button
          type="button"
          onClick={decrement}
          disabled={!canDecrement}
          aria-label="کاهش 15 دقیقه"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground transition hover:bg-surface-hover disabled:opacity-40"
        >
          <MinusIcon size={18} weight="bold" />
        </button>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
        {optional ? (
          <PresetChip selected={value == null} onClick={() => onChange(null)}>
            پیش‌فرض خدمت
          </PresetChip>
        ) : null}
        {PRESETS.map((minutes) => (
          <PresetChip key={minutes} selected={value === minutes} onClick={() => onChange(minutes)}>
            {formatDurationShort(minutes)}
          </PresetChip>
        ))}
      </div>

      {offGrid ? (
        <p className="text-xs text-warning">
          مدت باید مضرب 15 دقیقه باشد؛ با − یا + یا یکی از گزینه‌ها درستش کنید.
        </p>
      ) : null}
    </div>
  );
}

function PresetChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition",
        selected
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-surface text-foreground hover:bg-surface-hover"
      )}
    >
      {children}
    </button>
  );
}
