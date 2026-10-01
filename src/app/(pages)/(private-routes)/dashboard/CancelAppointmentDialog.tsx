"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/components/primitives/button/Button";
import { Input } from "@/shared/components/primitives/input/Input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/primitives/dialog/Dialog";
import { cn } from "@/shared/utils/className";
import { dashboardQuietButtonClass } from "./_components/buttonClasses";
import { NotifyCustomerCheckbox } from "./_components/NotifyCustomerCheckbox";

const REASONS = ["درخواست مشتری", "لغو توسط سالن"] as const;
const OTHER = "سایر";

interface CancelAppointmentDialogProps {
  appointmentId: number | null;
  /** e.g. «علی رضایی · پنج‌شنبه 18:30» — what is being cancelled. */
  subject?: string;
  onClose: () => void;
  onConfirm: (reason: string, notifyCustomer: boolean) => Promise<void>;
  isPending: boolean;
}

export default function CancelAppointmentDialog({
  appointmentId,
  subject,
  onClose,
  onConfirm,
  isPending,
}: CancelAppointmentDialogProps) {
  const [choice, setChoice] = useState<string>(REASONS[0]);
  const [otherText, setOtherText] = useState("");
  // SMS on by default for a salon-side cancel (backend contract).
  const [notifyCustomer, setNotifyCustomer] = useState(true);

  // Every newly targeted appointment starts fresh.
  useEffect(() => {
    if (appointmentId != null) {
      setChoice(REASONS[0]);
      setOtherText("");
      setNotifyCustomer(true);
    }
  }, [appointmentId]);

  const reason = choice === OTHER ? otherText.trim() : choice;

  return (
    <Dialog
      open={appointmentId != null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>لغو نوبت</DialogTitle>
          <DialogDescription>{subject || "این نوبت لغو می‌شود."}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          {[...REASONS, OTHER].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setChoice(r)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                choice === r
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-hover text-foreground-muted"
              )}
            >
              {r}
            </button>
          ))}
        </div>
        {choice === OTHER ? (
          <Input
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            placeholder="دلیل لغو"
            autoFocus
          />
        ) : null}
        <p className="text-xs leading-5 text-foreground-muted">
          بیعانه‌ای که با کیف پول پرداخت شده به کیف پول مشتری برمی‌گردد؛ بیعانه‌ی نقدی یا کارتی را خود سالن پس می‌دهد.
        </p>
        <NotifyCustomerCheckbox checked={notifyCustomer} onChange={setNotifyCustomer} />
        <DialogFooter className="mt-2">
          <Button
            type="button"
            variant="outline"
            className={dashboardQuietButtonClass}
            onClick={onClose}
          >
            انصراف
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="text-error hover:bg-error-background"
            onClick={() => void onConfirm(reason, notifyCustomer)}
            isLoading={isPending}
            disabled={!reason}
          >
            لغو نوبت
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
