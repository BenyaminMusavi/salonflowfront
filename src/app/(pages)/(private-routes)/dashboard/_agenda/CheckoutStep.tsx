"use client";

import { useState } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { Button } from "@/shared/components/primitives/button/Button";
import { MoneyInput } from "@/shared/components/primitives/input/MoneyInput";
import { PaymentMethod } from "@/services/common/enums/domain-enums";
import { useMutateSalonAppointment } from "@/services/domains/appointments/hooks";
import type { ISalonAppointmentDetails } from "@/services/domains/appointments/types/appointments.type";
import { generateIdempotencyKey } from "@/services/domains/payments/hooks";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { formatToman } from "@/shared/utils/salonDisplay";
import { cn } from "@/shared/utils/className";
import type { DashboardToastState } from "../_components/DashboardToast";

/** In-salon methods only: no online gateway, Wallet disabled on the backend. */
const METHODS = [
  { value: PaymentMethod.Cash, label: "نقد" },
  { value: PaymentMethod.Card, label: "کارت" },
  { value: PaymentMethod.Transfer, label: "انتقال" },
];

const seg = (active: boolean) =>
  cn(
    "flex-1 rounded-full py-2 text-sm font-semibold transition-colors",
    active ? "bg-primary text-primary-foreground" : "text-foreground-muted"
  );

const chip = (active: boolean) =>
  cn(
    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
    active ? "bg-primary text-primary-foreground" : "bg-surface-hover text-foreground-muted"
  );

/**
 * «دریافت پرداخت» in one request (`checkout`): completes the appointment when asked, issues
 * the final invoice, records the payment and an optional tip. Idempotent per attempt.
 */
export function CheckoutStep({
  details,
  completeFirst,
  canDiscount,
  onBack,
  onDone,
  onToast,
}: {
  details: ISalonAppointmentDetails;
  completeFirst: boolean;
  canDiscount: boolean;
  onBack: () => void;
  onDone: () => void;
  onToast: (t: DashboardToastState) => void;
}) {
  const mutate = useMutateSalonAppointment();
  const due = Math.max(0, details.money.outstanding);
  const [amount, setAmount] = useState<number | null>(due);
  const [method, setMethod] = useState<number>(PaymentMethod.Cash);
  const [discount, setDiscount] = useState<number | null>(null);
  const [tipOpen, setTipOpen] = useState(false);
  const [tipAmount, setTipAmount] = useState<number | null>(null);
  const people = Array.from(
    new Map(details.services.map((s) => [s.staffPublicId, s.staffName || "پرسنل"])).entries()
  );
  const [tipTo, setTipTo] = useState<string>(people[0]?.[0] ?? "");
  const [key] = useState(generateIdempotencyKey);
  const [error, setError] = useState("");
  const payable = Math.max(0, due - (discount ?? 0));

  const submit = async () => {
    if ((amount ?? 0) < 0 || (amount ?? 0) > payable) return setError(`حداکثر ${formatToman(payable)} تومان.`);
    if (!completeFirst && !(amount ?? 0) && !(tipAmount ?? 0)) return setError("مبلغ را وارد کنید.");
    setError("");
    try {
      const res = await mutate.checkout.mutateAsync({
        publicId: details.publicId,
        body: {
          completeFirst,
          payments: amount ? [{ method, amount }] : [],
          tip: tipOpen && tipAmount && tipTo ? { staffPublicId: tipTo, amount: tipAmount } : null,
          discount: canDiscount && discount ? discount : null,
          idempotencyKey: key,
        },
      });
      const left = res.data?.invoice?.outstanding ?? 0;
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
        <button type="button" onClick={onBack} aria-label="بازگشت" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-hover">
          <ArrowRightIcon size={18} />
        </button>
        <p className="text-base font-bold text-foreground">
          {completeFirst ? "انجام شد و دریافت" : "دریافت پرداخت"} · {details.customer?.fullName || "مشتری"}
        </p>
      </div>

      <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary text-sm">
        <div className="flex justify-between px-4 py-2.5">
          <span className="text-foreground-muted">جمع خدمات</span>
          <span className="tabular-nums text-foreground">{formatToman(details.money.total)} تومان</span>
        </div>
        {details.money.deposit > 0 ? (
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-foreground-muted">بیعانه‌ی پرداخت‌شده</span>
            <span className="tabular-nums text-foreground">− {formatToman(details.money.deposit)}</span>
          </div>
        ) : null}
        {details.money.paid > 0 ? (
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-foreground-muted">پرداخت‌شده</span>
            <span className="tabular-nums text-foreground">− {formatToman(details.money.paid)}</span>
          </div>
        ) : null}
        <div className="flex justify-between px-4 py-2.5 font-bold">
          <span className="text-foreground">مانده</span>
          <span className="tabular-nums text-foreground">{formatToman(payable)} تومان</span>
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

      {tipOpen ? (
        <div className="flex flex-col gap-2 rounded-[16px] bg-background-secondary p-3">
          <p className="text-xs font-semibold text-foreground-muted">انعام</p>
          {people.length > 1 ? (
            <div className="flex flex-wrap gap-2">
              {people.map(([id, name]) => (
                <button key={id} type="button" className={chip(tipTo === id)} onClick={() => setTipTo(id)}>
                  {name}
                </button>
              ))}
            </div>
          ) : null}
          <MoneyInput value={tipAmount} onValueChange={setTipAmount} placeholder={`انعام برای ${people.find(([id]) => id === tipTo)?.[1] ?? "پرسنل"}`} className="rounded-[12px]" />
        </div>
      ) : null}
      {canDiscount && discount != null ? (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-foreground-muted">تخفیف (از سهم سالن کم می‌شود)</p>
          <MoneyInput value={discount} onValueChange={(v) => setDiscount(v ?? 0)} className="rounded-[12px]" />
        </div>
      ) : null}
      <div className="flex gap-4 px-1">
        {!tipOpen && people.length ? (
          <button type="button" onClick={() => setTipOpen(true)} className="text-xs font-semibold text-primary">＋ انعام</button>
        ) : null}
        {canDiscount && discount == null && !details.money.paid ? (
          <button type="button" onClick={() => setDiscount(0)} className="text-xs font-semibold text-primary">＋ تخفیف</button>
        ) : null}
      </div>

      {error ? <p className="text-xs text-error">{error}</p> : null}
      <Button type="button" className="w-full rounded-[12px]" isLoading={mutate.checkout.isPending} onClick={() => void submit()}>
        {amount ? `ثبت ${formatToman(amount)} تومان` : completeFirst ? "ثبت انجام، بدون پرداخت" : "ثبت"}
      </Button>
    </div>
  );
}
