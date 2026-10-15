"use client";

import { useState } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { Button } from "@/shared/components/primitives/button/Button";
import { MoneyInput } from "@/shared/components/primitives/input/MoneyInput";
import { AppointmentStatus, PaymentMethod } from "@/services/common/enums/domain-enums";
import { useMutateSalonAppointment } from "@/services/domains/appointments/hooks";
import type { IAppointmentDeposit, ISalonAppointmentDetails } from "@/services/domains/appointments/types/appointments.type";
import { generateIdempotencyKey } from "@/services/domains/payments/hooks";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { formatToman } from "@/shared/utils/salonDisplay";
import { cn } from "@/shared/utils/className";
import type { DashboardToastState } from "../_components/DashboardToast";

/** A deposit is received in person: cash, card or card-to-card (no wallet / online here). */
const METHODS = [
  { value: PaymentMethod.Cash, label: "نقد" },
  { value: PaymentMethod.Card, label: "کارت" },
  { value: PaymentMethod.Transfer, label: "کارت‌به‌کارت" },
];

const seg = (active: boolean) =>
  cn(
    "flex-1 rounded-full py-2 text-sm font-semibold transition-colors",
    active ? "bg-primary text-primary-foreground" : "text-foreground-muted"
  );

/**
 * «بیعانه» of one appointment, from `GET .../deposit`: received vs due while it is booked (with an
 * optional «دریافت بیعانه»), and — after a cancel / no-show — what to hand back and what is kept.
 * Hidden when the appointment has no deposit.
 */
export function DepositBlock({
  deposit,
  status,
  canReceive,
  onReceive,
}: {
  deposit: IAppointmentDeposit | undefined;
  status: number;
  canReceive: boolean;
  onReceive: () => void;
}) {
  if (!deposit || deposit.depositDue <= 0) return null;

  const settled = status === AppointmentStatus.Cancelled || status === AppointmentStatus.NoShow;
  if (settled) {
    if (deposit.settledRefundAmount <= 0 && deposit.settledPenaltyAmount <= 0) return null;
    return (
      <div className="flex flex-col gap-1 rounded-[16px] bg-background-secondary px-4 py-3 text-sm">
        {deposit.settledRefundAmount > 0 ? (
          <p className="font-semibold text-warning">
            {formatToman(deposit.settledRefundAmount)} تومان از بیعانه را به مشتری برگردانید.
          </p>
        ) : null}
        {deposit.settledPenaltyAmount > 0 ? (
          <p className="text-xs text-foreground-muted">
            {formatToman(deposit.settledPenaltyAmount)} تومان به‌عنوان جریمه نزد سالن می‌ماند.
          </p>
        ) : null}
      </div>
    );
  }

  const canTake = status === AppointmentStatus.Scheduled && canReceive && deposit.depositRemaining > 0;
  return (
    <div className="flex flex-col gap-2 rounded-[16px] bg-background-secondary px-4 py-3 text-sm">
      <div className="flex justify-between">
        <span className="text-foreground-muted">بیعانه</span>
        <span className="tabular-nums text-foreground">
          {formatToman(deposit.depositPaid)} از {formatToman(deposit.depositDue)} تومان دریافت شده
        </span>
      </div>
      {deposit.depositRemaining <= 0 ? (
        <p className="text-xs font-semibold text-success">بیعانه کامل دریافت شده است.</p>
      ) : canTake ? (
        <button type="button" onClick={onReceive} className="self-start text-xs font-semibold text-primary">
          ＋ دریافت بیعانه ({formatToman(deposit.depositRemaining)} تومان مانده)
        </button>
      ) : null}
    </div>
  );
}

/** «دریافت بیعانه»: amount (defaults to the whole remainder, parts allowed) + how it was paid. */
export function DepositStep({
  details,
  deposit,
  onBack,
  onDone,
  onToast,
}: {
  details: ISalonAppointmentDetails;
  deposit: IAppointmentDeposit;
  onBack: () => void;
  onDone: () => void;
  onToast: (t: DashboardToastState) => void;
}) {
  const mutate = useMutateSalonAppointment();
  const remaining = Math.max(0, deposit.depositRemaining);
  const [amount, setAmount] = useState<number | null>(remaining);
  const [method, setMethod] = useState<number>(PaymentMethod.Cash);
  // One key per opened step: a double tap or a retry after a network drop records the money once.
  const [key] = useState(generateIdempotencyKey);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!amount || amount <= 0) return setError("مبلغ بیعانه را وارد کنید.");
    if (amount > remaining) return setError(`حداکثر ${formatToman(remaining)} تومان.`);
    setError("");
    try {
      const res = await mutate.recordDeposit.mutateAsync({
        publicId: details.publicId,
        body: { amount, paymentMethod: method, idempotencyKey: key },
      });
      const left = res.data?.depositRemaining ?? 0;
      onToast({
        type: "success",
        message: left > 0 ? `بیعانه ثبت شد · ${formatToman(left)} تومان مانده` : "بیعانه کامل دریافت شد.",
      });
      onDone();
    } catch (err) {
      setError(getApiErrorMessage(err, "ثبت بیعانه ناموفق بود."));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onBack} aria-label="بازگشت" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-hover">
          <ArrowRightIcon size={18} />
        </button>
        <p className="text-base font-bold text-foreground">دریافت بیعانه · {details.customer?.fullName || "مشتری"}</p>
      </div>

      <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary text-sm">
        <div className="flex justify-between px-4 py-2.5">
          <span className="text-foreground-muted">بیعانه‌ی این نوبت</span>
          <span className="tabular-nums text-foreground">{formatToman(deposit.depositDue)} تومان</span>
        </div>
        {deposit.depositPaid > 0 ? (
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-foreground-muted">دریافت‌شده</span>
            <span className="tabular-nums text-foreground">− {formatToman(deposit.depositPaid)}</span>
          </div>
        ) : null}
        <div className="flex justify-between px-4 py-2.5 font-bold">
          <span className="text-foreground">مانده</span>
          <span className="tabular-nums text-foreground">{formatToman(remaining)} تومان</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold text-foreground-muted">مبلغ دریافتی</p>
        <MoneyInput value={amount} onValueChange={setAmount} className="rounded-[12px]" />
      </div>
      <div className="flex gap-1 rounded-full bg-background-secondary p-1">
        {METHODS.map((m) => (
          <button key={m.value} type="button" className={seg(method === m.value)} onClick={() => setMethod(m.value)}>
            {m.label}
          </button>
        ))}
      </div>

      {error ? <p className="text-xs text-error">{error}</p> : null}
      <Button type="button" className="w-full rounded-[12px]" isLoading={mutate.recordDeposit.isPending} onClick={() => void submit()}>
        {amount ? `ثبت ${formatToman(amount)} تومان` : "ثبت بیعانه"}
      </Button>
    </div>
  );
}
