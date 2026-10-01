"use client";

import { useEffect, useState } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { Button } from "@/shared/components/primitives/button/Button";
import { MoneyInput } from "@/shared/components/primitives/input/MoneyInput";
import { PaymentMethod } from "@/services/common/enums/domain-enums";
import { useMutateInvoices } from "@/services/domains/invoices/hooks";
import { useMutatePayments } from "@/services/domains/payments/hooks";
import type { IInvoice } from "@/services/domains/invoices/types/invoices.type";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { formatToman } from "@/shared/utils/salonDisplay";
import { cn } from "@/shared/utils/className";
import type { DashboardToastState } from "../_components/DashboardToast";

/** In-salon methods only: there is no online gateway, and Wallet is disabled on the backend. */
const METHODS = [
  { value: PaymentMethod.Cash, label: "نقد" },
  { value: PaymentMethod.Card, label: "کارت" },
  { value: PaymentMethod.Transfer, label: "انتقال" },
];

const chip = (active: boolean) =>
  cn(
    "flex-1 rounded-full py-2 text-sm font-semibold transition-colors",
    active ? "bg-primary text-primary-foreground" : "bg-surface-hover text-foreground-muted"
  );

/**
 * «دریافت پرداخت» for a completed appointment. The invoice is an implementation detail: it is
 * issued here on first payment (`from-appointment`), so the owner only sees amount + method.
 */
export function PaymentStep({
  appointmentId,
  invoice,
  fallbackAmount,
  title,
  onBack,
  onDone,
  onToast,
}: {
  appointmentId: number | null;
  /** Existing invoice of the appointment, if any. */
  invoice: IInvoice | null;
  /** Amount to suggest when no invoice exists yet (the appointment's total). */
  fallbackAmount: number;
  title: string;
  onBack?: () => void;
  onDone: () => void;
  onToast: (t: DashboardToastState) => void;
}) {
  const invoices = useMutateInvoices();
  const payments = useMutatePayments();
  const due = invoice?.outstandingAmount ?? fallbackAmount;
  const [amount, setAmount] = useState<number | null>(due);
  const [method, setMethod] = useState<number>(PaymentMethod.Cash);
  const [error, setError] = useState("");

  useEffect(() => setAmount(due), [due]);

  const submit = async () => {
    if (!amount || amount <= 0) return setError("مبلغ را وارد کنید.");
    if (amount > due && invoice) return setError(`مانده‌ی این نوبت ${formatToman(due)} تومان است.`);
    setError("");
    try {
      let invoiceId = invoice?.id;
      if (!invoiceId) {
        if (appointmentId == null) throw new Error("نوبت مشخص نیست.");
        const res = await invoices.createFromAppointment.mutateAsync(appointmentId);
        invoiceId = res.data?.id;
        if (!invoiceId) throw new Error("صدور فاکتور ناموفق بود.");
      }
      const res = await payments.create.mutateAsync({ invoiceId, amount, paymentMethod: method });
      const left = res.data?.invoiceOutstanding ?? 0;
      onToast({
        type: "success",
        message: left > 0 ? `پرداخت ثبت شد · مانده ${formatToman(left)} تومان` : "پرداخت کامل ثبت شد.",
      });
      onDone();
    } catch (err) {
      setError(getApiErrorMessage(err, "ثبت پرداخت ناموفق بود."));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="بازگشت"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-hover"
          >
            <ArrowRightIcon size={18} />
          </button>
        ) : null}
        <p className="text-base font-bold text-foreground">دریافت پرداخت · {title}</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold text-foreground-muted">مبلغ</p>
        <MoneyInput value={amount} onValueChange={setAmount} className="rounded-[12px]" />
        {invoice && invoice.outstandingAmount != null && invoice.grandTotal != null && invoice.outstandingAmount < invoice.grandTotal ? (
          <p className="text-[11px] text-foreground-muted">
            از {formatToman(invoice.grandTotal)} تومان، {formatToman(invoice.grandTotal - invoice.outstandingAmount)} تومان قبلاً پرداخت شده.
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold text-foreground-muted">روش</p>
        <div className="flex gap-2 rounded-full bg-background-secondary p-1">
          {METHODS.map((m) => (
            <button key={m.value} type="button" className={chip(method === m.value)} onClick={() => setMethod(m.value)}>
              {m.label}
            </button>
          ))}
        </div>
      </div>
      {error ? <p className="text-xs text-error">{error}</p> : null}
      <Button
        type="button"
        className="w-full rounded-[12px]"
        isLoading={invoices.createFromAppointment.isPending || payments.create.isPending}
        onClick={() => void submit()}
      >
        ثبت پرداخت {amount ? `${formatToman(amount)} تومان` : ""}
      </Button>
    </div>
  );
}
