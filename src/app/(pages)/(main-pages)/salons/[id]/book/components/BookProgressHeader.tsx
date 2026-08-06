"use client";

const STEPS = [
  { id: 1, label: "شعبه" },
  { id: 2, label: "خدمات" },
  { id: 3, label: "تاریخ" },
  { id: 4, label: "پرسنل" },
  { id: 5, label: "پیش‌فاکتور" },
  { id: 6, label: "ساعت" },
  { id: 7, label: "تأیید" },
] as const;

interface BookProgressHeaderProps {
  step: number;
  branchChip?: string | null;
}

export default function BookProgressHeader({
  step,
  branchChip,
}: BookProgressHeaderProps) {
  const clamped = Math.min(7, Math.max(1, step));
  const label = STEPS.find((s) => s.id === clamped)?.label ?? "";
  const progress = ((clamped - 1) / 6) * 100;

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
          گام {clamped.toLocaleString("fa-IR")} از ۷ · {label}
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
