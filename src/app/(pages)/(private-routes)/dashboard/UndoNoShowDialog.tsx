"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/shared/components/primitives/button/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/primitives/dialog/Dialog";
import {
  UNDO_NO_SHOW_REASON_MAX,
  checkUndoNoShowReason,
} from "@/services/domains/appointments/utils/undoNoShow";
import { APP_LOCALE } from "@/shared/utils/locale";
import { cn } from "@/shared/utils/className";
import { dashboardQuietButtonClass } from "./_components/buttonClasses";

interface UndoNoShowDialogProps {
  open: boolean;
  /** e.g. «علی رضایی · پنج‌شنبه 18:30» — which appointment is being corrected. */
  subject?: string;
  /** True while the request is in flight: blocks a second submit. */
  isPending: boolean;
  /** Server / validation error of the last attempt; the typed reason is kept so the owner can retry. */
  error?: string | null;
  onClose: () => void;
  onConfirm: (reason: string) => void | Promise<void>;
}

/**
 * Correction of a mistaken «مراجعه نکرد». Whether it may be offered at all (owner, within the server's
 * window) is decided by `allowedActions` before this opens; here the reason is required and capped at the
 * backend's 482 characters.
 */
export default function UndoNoShowDialog({
  open,
  subject,
  isPending,
  error,
  onClose,
  onConfirm,
}: UndoNoShowDialogProps) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const submitting = useRef(false);

  // Every time it opens it starts empty.
  useEffect(() => {
    if (open) {
      setReason("");
      setTouched(false);
      submitting.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (!isPending) submitting.current = false;
  }, [isPending]);

  const check = checkUndoNoShowReason(reason);
  const length = reason.trim().length;
  const tooLong = length > UNDO_NO_SHOW_REASON_MAX;
  const validationError = touched && !check.ok ? check.error : null;

  const submit = () => {
    setTouched(true);
    if (!check.ok || isPending || submitting.current) return;
    submitting.current = true;
    void onConfirm(check.reason);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !isPending && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>اصلاح «مراجعه نکرد»</DialogTitle>
          <DialogDescription>
            {subject || "این نوبت دوباره باز می‌شود."}
          </DialogDescription>
        </DialogHeader>

        <p className="text-xs leading-5 text-foreground-muted">
          نوبت به حالت «رزرو شده» برمی‌گردد و بخشی از بیعانه که به‌خاطر «مراجعه نکرد» برای سالن ضبط شده بود، دوباره نزد سالن نگه داشته می‌شود.
          پولی که قبلاً به مشتری برگشته پس گرفته نمی‌شود.
        </p>

        <label className="mt-3 flex flex-col gap-1.5 text-sm">
          <span className="text-foreground-muted">علت اصلاح</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(true)}
            rows={3}
            autoFocus
            aria-invalid={!!validationError || tooLong}
            aria-describedby="undo-no-show-reason-hint"
            className="w-full rounded-[12px] border border-input-border bg-input p-3 text-sm text-foreground focus:outline-none"
            placeholder="مثلاً: مشتری رسیده بود و اشتباه ثبت شد"
          />
          <span
            id="undo-no-show-reason-hint"
            className={cn("flex justify-between text-xs", tooLong ? "text-error" : "text-foreground-muted")}
          >
            <span>{validationError ?? "علت در تاریخچه‌ی نوبت می‌ماند."}</span>
            <span className="tabular-nums" dir="ltr">
              {length.toLocaleString(APP_LOCALE)} / {UNDO_NO_SHOW_REASON_MAX.toLocaleString(APP_LOCALE)}
            </span>
          </span>
        </label>

        {error ? (
          <p role="alert" className="mt-2 rounded-[12px] bg-error-background px-3 py-2 text-xs leading-5 text-error">
            {error}
          </p>
        ) : null}

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            className={dashboardQuietButtonClass}
            onClick={onClose}
            disabled={isPending}
          >
            انصراف
          </Button>
          <Button type="button" onClick={submit} isLoading={isPending} disabled={!check.ok}>
            اصلاح و بازکردن نوبت
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
