"use client";

import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/shared/components/primitives/drawer/Drawer";
import { Button } from "@/shared/components/primitives/button/Button";
import { Input } from "@/shared/components/primitives/input/Input";
import { useMutateMarkInvoicePaid } from "@/services/domains/subscriptions/hooks/useMutateMarkInvoicePaid";
import { IAdminPlatformInvoiceListItem } from "@/services/domains/subscriptions/types/subscriptions.type";
import { formatRialAsToman } from "@/services/domains/subscriptions/utils/subscription-display";

export function MarkInvoicePaidDrawer({
  invoice,
  onClose,
}: {
  invoice: IAdminPlatformInvoiceListItem | null;
  onClose: () => void;
}) {
  const [paymentMethodNote, setPaymentMethodNote] = useState("");
  const [externalPaymentRef, setExternalPaymentRef] = useState("");

  useEffect(() => {
    setPaymentMethodNote("");
    setExternalPaymentRef("");
  }, [invoice]);

  const { mutateAsync, isPending } = useMutateMarkInvoicePaid();

  const handleConfirm = async () => {
    if (!invoice) return;
    try {
      await mutateAsync({
        invoiceId: invoice.id,
        data: {
          paymentMethodNote: paymentMethodNote.trim() || undefined,
          externalPaymentRef: externalPaymentRef.trim() || null,
        },
      });
      onClose();
    } catch {
      /* keep drawer open on failure */
    }
  };

  return (
    <Drawer
      open={!!invoice}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      direction="right"
    >
      <DrawerContent showHandle={false} className="w-full sm:max-w-sm">
        <DrawerHeader className="border-b border-border text-right">
          <DrawerTitle className="text-base">ثبت پرداخت فاکتور</DrawerTitle>
          <DrawerDescription className="text-xs">
            {invoice ? `فاکتور ${invoice.invoiceNumber} — ${invoice.ownerName}` : ""}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {invoice ? (
            <div className="flex flex-col gap-4">
              <div className="rounded-lg border border-border p-3 text-[13px]">
                <div className="flex items-center justify-between py-1">
                  <span className="text-foreground-muted">مبلغ</span>
                  <span className="font-bold text-foreground">
                    {formatRialAsToman(invoice.grandTotal)} تومان
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-foreground-muted">شماره تماس مالک</span>
                  <span className="font-medium text-foreground" dir="ltr">
                    {invoice.ownerPhone}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-foreground">
                  روش پرداخت (اختیاری)
                </label>
                <Input
                  placeholder="مثلاً کارت به کارت"
                  value={paymentMethodNote}
                  onChange={(e) => setPaymentMethodNote(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-foreground">
                  کد مرجع پرداخت (اختیاری)
                </label>
                <Input
                  placeholder="شمارهٔ پیگیری تراکنش"
                  value={externalPaymentRef}
                  onChange={(e) => setExternalPaymentRef(e.target.value)}
                  dir="ltr"
                />
              </div>
            </div>
          ) : null}
        </div>

        <DrawerFooter className="border-t border-border">
          <div className="flex gap-2">
            <Button className="flex-1" isLoading={isPending} onClick={handleConfirm}>
              ثبت پرداخت و فعال‌سازی اشتراک
            </Button>
            <Button variant="secondary" onClick={onClose} disabled={isPending}>
              انصراف
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
