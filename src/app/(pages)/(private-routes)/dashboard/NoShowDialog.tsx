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
  onClose: () => void;
  onConfirm: (notifyCustomer: boolean) => Promise<void>;
  isPending: boolean;
}

/** Confirms «عدم حضور»; the SMS to the customer is opt-in (off by default, backend contract). */
export default function NoShowDialog({
  appointmentId,
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
          <DialogTitle>ثبت عدم حضور</DialogTitle>
          <DialogDescription>مشتری در زمان نوبت مراجعه نکرده است.</DialogDescription>
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
            ثبت عدم حضور
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
