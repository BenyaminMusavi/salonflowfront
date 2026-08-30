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
import { dashboardQuietButtonClass } from "./_components/buttonClasses";

const DEFAULT_CANCEL_REASON = "لغو توسط سالن";

interface CancelAppointmentDialogProps {
  appointmentId: number | null;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isPending: boolean;
}

export default function CancelAppointmentDialog({
  appointmentId,
  onClose,
  onConfirm,
  isPending,
}: CancelAppointmentDialogProps) {
  const [reason, setReason] = useState(DEFAULT_CANCEL_REASON);

  // Mirrors the old inline `setCancelId(item.id); setCancelReason(DEFAULT)` pairing
  // from before this dialog owned its own reason state: every time a new appointment
  // is targeted, the reason field starts fresh.
  useEffect(() => {
    if (appointmentId != null) setReason(DEFAULT_CANCEL_REASON);
  }, [appointmentId]);

  const handleConfirm = async () => {
    const trimmed = reason.trim();
    if (!trimmed) return;
    await onConfirm(trimmed);
  };

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
          <DialogDescription>
            دلیل لغو را وارد کنید. این متن برای مشتری ثبت می‌شود.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="دلیل لغو"
        />
        <DialogFooter className="mt-4">
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
            onClick={() => void handleConfirm()}
            isLoading={isPending}
            disabled={!reason.trim()}
          >
            تأیید لغو
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
