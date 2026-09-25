"use client";
import { APP_LOCALE } from "@/shared/utils/locale";

const STEPS = [
  { id: 1, label: "خدمات" },
  { id: 2, label: "پرسنل" },
  { id: 3, label: "تاریخ و ساعت" },
  { id: 4, label: "پیش‌فاکتور" },
  { id: 5, label: "تأیید" },
] as const;

export const BOOK_TOTAL_STEPS = STEPS.length;

interface BookProgressHeaderProps {
  step: number;
  branchChip?: string | null;
}

export default function BookProgressHeader({
  step,
  branchChip,
}: BookProgressHeaderProps) {
  const clamped = Math.min(BOOK_TOTAL_STEPS, Math.max(1, step));
  const label = STEPS.find((s) => s.id === clamped)?.label ?? "";
  const progress = ((clamped - 1) / (BOOK_TOTAL_STEPS - 1)) * 100;

  return (
    <div className="px-safe-area pt-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">
          گام {clamped.toLocaleString(APP_LOCALE)} از{" "}
          {BOOK_TOTAL_STEPS.toLocaleString(APP_LOCALE)} · {label}
        </p>
        {branchChip ? (
          <span className="rounded-full bg-surface px-3 py-1 text-[11px] text-foreground-muted">
            شعبه: {branchChip}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export { STEPS as BOOK_STEP_LABELS };
