"use client";

interface BookStickyCtaProps {
  step: number;
  canContinue: boolean;
  isCreating?: boolean;
  isLoggedIn?: boolean;
  onBack: () => void;
  onContinue: () => void;
  onConfirm: () => void;
  summary?: string | null;
}

export default function BookStickyCta({
  step,
  canContinue,
  isCreating = false,
  isLoggedIn = true,
  onBack,
  onContinue,
  onConfirm,
  summary,
}: BookStickyCtaProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-center bg-background/95 p-4 backdrop-blur">
      <div className="flex w-full max-w-[600px] flex-col gap-2">
        {summary ? (
          <p className="text-center text-xs text-foreground-muted">{summary}</p>
        ) : null}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={isCreating}
            className="flex-1 rounded-full border border-border bg-transparent py-4 text-sm font-bold text-foreground disabled:opacity-40"
          >
            بازگشت
          </button>
          {step < 7 ? (
            <button
              type="button"
              onClick={onContinue}
              disabled={!canContinue || isCreating}
              className="flex-[2] rounded-full bg-primary py-4 text-sm font-bold text-primary-foreground disabled:opacity-40"
            >
              ادامه
            </button>
          ) : (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isCreating}
              className="flex-[2] rounded-full bg-primary py-4 text-sm font-bold text-primary-foreground disabled:opacity-40"
            >
              {isCreating
                ? "در حال ثبت…"
                : isLoggedIn
                  ? "ثبت نوبت"
                  : "ورود و ثبت نوبت"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
