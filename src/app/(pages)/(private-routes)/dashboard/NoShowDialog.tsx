"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/components/primitives/button/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/primitives/dialog/Dialog";
import { dashboardQuietButtonClass } from "./_components/buttonClasses";
import { NotifyCustomerCheckbox } from "./_components/NotifyCustomerCheckbox";

interface NoShowDialogProps {
  appointmentId: number | null;
  subject?: string;
  onClose: () => void;
  onConfirm: (notifyCustomer: boolean) => Promise<void>;
  isPending: boolean;
}

/** Confirms «مراجعه نکرد»; the SMS to the customer is opt-in (off by default, backend contract). */
export default function NoShowDialog({
  appointmentId,
  subject,
  onClose,
  onConfirm,
  isPending,
}: NoShowDialogProps) {
  const [notifyCustomer, setNotifyCustomer] = useState(false);

  useEffect(() => {
    if (appointmentId != null) setNotifyCustomer(false);
  }, [appointmentId]);

  return (
    <Dialog open={appointmentId != null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>مشتری مراجعه نکرد؟</DialogTitle>
          <DialogDescription>{subject || "این نوبت به‌عنوان «مراجعه نکرد» ثبت می‌شود."}</DialogDescription>
        </DialogHeader>
        <NotifyCustomerCheckbox checked={notifyCustomer} onChange={setNotifyCustomer} />
        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            className={dashboardQuietButtonClass}
            onClick={onClose}
          >
            انصراف
          </Button>
          <Button type="button" onClick={() => void onConfirm(notifyCustomer)} isLoading={isPending}>
            ثبت «مراجعه نکرد»
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
