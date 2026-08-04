"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/shared/components/primitives/button/Button";
import { Input } from "@/shared/components/primitives/input/Input";
import { useQuerySalonAppointments } from "@/services/domains/appointments/hooks";
import { AppointmentStatus, PaymentMethod, PaymentType } from "@/services/common/enums/domain-enums";
import { useMutateInvoices, useQueryInvoices } from "@/services/domains/invoices/hooks";
import { useMutatePayments, useQueryPaymentsByInvoice } from "@/services/domains/payments/hooks";
import { useMutateWallet, useQueryWalletByCustomer, useQueryWalletTransactions } from "@/services/domains/wallets/hooks";
import { useMutateTips } from "@/services/domains/tips/hooks";
import { useQueryCustomers } from "@/services/domains/customers/hooks";
import { formatToman } from "@/shared/utils/salonDisplay";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";

const toDateOnly = (d: Date) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function FinanceView() {
  const [date, setDate] = useState(toDateOnly(new Date()));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const completedAppointmentsQuery = useQuerySalonAppointments(date, {
    status: AppointmentStatus.Completed,
    pageSize: 100,
  });
  const completedAppointments = completedAppointmentsQuery.data?.data?.items ?? [];

  const invoicesQuery = useQueryInvoices({ pageSize: 50 });
  const invoices = invoicesQuery.data?.data?.items ?? [];
  const invoiceMutations = useMutateInvoices();

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | "">("");
  const paymentsQuery = useQueryPaymentsByInvoice(
    selectedInvoiceId ? Number(selectedInvoiceId) : undefined
  );
  const payments = paymentsQuery.data?.data ?? [];
  const paymentMutations = useMutatePayments();
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<number>(PaymentMethod.Cash);

  const [customerSearch, setCustomerSearch] = useState("");
  const customersQuery = useQueryCustomers(customerSearch);
  const customerListRaw = customersQuery.data?.data;
  const customers = useMemo(() => {
    if (Array.isArray(customerListRaw)) return customerListRaw;
    if (customerListRaw && typeof customerListRaw === "object" && "items" in customerListRaw) {
      return ((customerListRaw as { items?: unknown[] }).items ?? []) as Array<{
        id: number;
        fullName: string;
        phone: string;
      }>;
    }
    return [];
  }, [customerListRaw]);

  const [customerId, setCustomerId] = useState<number | "">("");
  const walletQuery = useQueryWalletByCustomer(customerId ? Number(customerId) : undefined);
  const walletTxQuery = useQueryWalletTransactions(customerId ? Number(customerId) : undefined);
  const walletMutations = useMutateWallet();
  const [walletAmount, setWalletAmount] = useState("");

  const tipsMutate = useMutateTips();
  const [tipStaffId, setTipStaffId] = useState("");
  const [tipAmount, setTipAmount] = useState("");
  const [tipAppointmentId, setTipAppointmentId] = useState("");

  const issueInvoice = async (appointmentId: number) => {
    setError("");
    setSuccess("");
    try {
      const res = await invoiceMutations.createFromAppointment.mutateAsync(appointmentId);
      setSuccess(`فاکتور ایجاد شد (شماره: ${res.data?.id ?? "-"})`);
    } catch (err) {
      setError(getApiErrorMessage(err, "صدور فاکتور ناموفق بود."));
    }
  };

  const submitPayment = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!selectedInvoiceId || !amount) {
      setError("شماره فاکتور و مبلغ پرداخت الزامی است.");
      return;
    }
    try {
      const res = await paymentMutations.create.mutateAsync({
        invoiceId: Number(selectedInvoiceId),
        amount: Number(amount),
        paymentMethod,
        paymentType: PaymentType.Full,
      });
      setSuccess(
        res.data?.isDuplicate
          ? "این پرداخت قبلا ثبت شده بود (idempotent)."
          : `پرداخت ثبت شد. مانده فاکتور: ${formatToman(res.data?.invoiceOutstanding)}`
      );
      setAmount("");
    } catch (err) {
      setError(getApiErrorMessage(err, "ثبت پرداخت ناموفق بود."));
    }
  };

  const walletOp = async (type: "charge" | "debit") => {
    setError("");
    setSuccess("");
    if (!customerId || !walletAmount) {
      setError("مشتری و مبلغ کیف پول الزامی است.");
      return;
    }
    try {
      const body = {
        customerId: Number(customerId),
        amount: Number(walletAmount),
        description: type === "charge" ? "شارژ توسط سالن" : "برداشت توسط سالن",
      };
      if (type === "charge") {
        await walletMutations.charge.mutateAsync(body);
        setSuccess("کیف پول مشتری شارژ شد.");
      } else {
        await walletMutations.debit.mutateAsync(body);
        setSuccess("از کیف پول مشتری برداشت شد.");
      }
      setWalletAmount("");
    } catch (err) {
      setError(getApiErrorMessage(err, "عملیات کیف پول ناموفق بود."));
    }
  };

  const submitTip = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!tipStaffId || !tipAmount) {
      setError("شناسه پرسنل و مبلغ انعام الزامی است.");
      return;
    }
    try {
      await tipsMutate.mutateAsync({
        staffMemberId: Number(tipStaffId),
        amount: Number(tipAmount),
        appointmentId: tipAppointmentId ? Number(tipAppointmentId) : undefined,
      });
      setSuccess("انعام ثبت شد.");
      setTipAmount("");
      setTipAppointmentId("");
    } catch (err) {
      setError(getApiErrorMessage(err, "ثبت انعام ناموفق بود."));
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-col gap-4 px-safe-area pb-8">
      <div className="rounded-lg bg-surface-secondary p-3">
        <h1 className="text-base font-bold text-foreground">ماژول مالی</h1>
      </div>

      <div className="rounded-lg bg-surface-secondary p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">صدور فاکتور از نوبت Completed</h2>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 min-h-10"
            inputWrapperClassname="w-[150px]"
          />
        </div>
        <div className="space-y-2">
          {completedAppointments.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded border border-border p-2">
              <span className="text-xs text-foreground-muted">
                نوبت #{a.id} - {a.staffNames || "بدون پرسنل"}
              </span>
              <Button size="sm" onClick={() => issueInvoice(a.id)}>
                صدور فاکتور
              </Button>
            </div>
          ))}
          {completedAppointments.length === 0 ? (
            <p className="text-xs text-foreground-muted">برای این تاریخ نوبت تکمیل‌شده‌ای یافت نشد.</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-lg bg-surface-secondary p-3">
        <h2 className="mb-2 text-sm font-bold text-foreground">ثبت پرداخت</h2>
        <form className="grid grid-cols-1 gap-2" onSubmit={submitPayment}>
          <select
            className="h-12 rounded-[2px] bg-foreground/5 px-3 text-sm text-foreground"
            value={selectedInvoiceId}
            onChange={(e) => setSelectedInvoiceId(Number(e.target.value))}
          >
            <option value="">انتخاب فاکتور</option>
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                فاکتور #{inv.id} - مانده {formatToman(inv.outstandingAmount)}
              </option>
            ))}
          </select>
          <Input
            type="number"
            placeholder="مبلغ"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <select
            className="h-12 rounded-[2px] bg-foreground/5 px-3 text-sm text-foreground"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(Number(e.target.value))}
          >
            <option value={PaymentMethod.Cash}>نقدی</option>
            <option value={PaymentMethod.Card}>کارت</option>
            <option value={PaymentMethod.Online}>آنلاین</option>
            <option value={PaymentMethod.Transfer}>انتقال</option>
            <option value={PaymentMethod.Wallet}>کیف پول</option>
          </select>
          <Button type="submit" isLoading={paymentMutations.create.isPending}>
            ثبت پرداخت
          </Button>
        </form>
        <div className="mt-2 space-y-1">
          {payments.map((p, i) => (
            <p key={`${p.id}-${i}`} className="text-xs text-foreground-muted">
              پرداخت #{p.id} | {formatToman(p.amount)} | روش {p.paymentMethod}
            </p>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-surface-secondary p-3">
        <h2 className="mb-2 text-sm font-bold text-foreground">کیف پول مشتری</h2>
        <Input
          placeholder="جستجوی مشتری"
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
        />
        <select
          className="mt-2 h-12 w-full rounded-[2px] bg-foreground/5 px-3 text-sm text-foreground"
          value={customerId}
          onChange={(e) => setCustomerId(Number(e.target.value))}
        >
          <option value="">انتخاب مشتری</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.fullName} - {c.phone}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-foreground-muted">
          موجودی: {formatToman(walletQuery.data?.data?.balance)} تومان
        </p>
        <div className="mt-2 flex gap-2">
          <Input
            type="number"
            placeholder="مبلغ"
            value={walletAmount}
            onChange={(e) => setWalletAmount(e.target.value)}
          />
          <Button size="sm" onClick={() => walletOp("charge")}>
            شارژ
          </Button>
          <Button size="sm" variant="outline" onClick={() => walletOp("debit")}>
            برداشت
          </Button>
        </div>
        <div className="mt-2 space-y-1">
          {(walletTxQuery.data?.data ?? []).slice(0, 5).map((t) => (
            <p key={t.id} className="text-xs text-foreground-muted">
              {formatToman(t.amount)} | {t.description || "بدون توضیح"}
            </p>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-surface-secondary p-3">
        <h2 className="mb-2 text-sm font-bold text-foreground">ثبت انعام</h2>
        <form className="grid grid-cols-1 gap-2" onSubmit={submitTip}>
          <Input
            type="number"
            placeholder="شناسه پرسنل"
            value={tipStaffId}
            onChange={(e) => setTipStaffId(e.target.value)}
          />
          <Input
            type="number"
            placeholder="مبلغ انعام"
            value={tipAmount}
            onChange={(e) => setTipAmount(e.target.value)}
          />
          <Input
            type="number"
            placeholder="شناسه نوبت (اختیاری)"
            value={tipAppointmentId}
            onChange={(e) => setTipAppointmentId(e.target.value)}
          />
          <Button type="submit" isLoading={tipsMutate.isPending}>
            ثبت انعام
          </Button>
        </form>
      </div>

      {error ? <p className="text-sm text-error">{error}</p> : null}
      {success ? <p className="text-sm text-primary">{success}</p> : null}
    </div>
  );
}

