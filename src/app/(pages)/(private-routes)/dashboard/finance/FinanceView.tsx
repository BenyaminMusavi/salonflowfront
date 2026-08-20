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
import { useQueryCatalogOfferings } from "@/services/domains/catalog/hooks";
import { useQueryStaffForOfferings } from "@/services/domains/staff-profile/hooks/useQueryStaffForOfferings";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { formatToman } from "@/shared/utils/salonDisplay";
import { paymentMethodLabel } from "@/services/domains/reports/utils/report-display";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import {
  DashboardCard,
  DashboardDateField,
  DashboardPage,
  DashboardPageHeader,
  DashboardSelect,
  DashboardToast,
  todayGregorian,
  type DashboardToastState,
} from "../_components";
import { dashboardQuietButtonClass } from "../_components/buttonClasses";

function staffLabel(member: {
  id?: number;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}) {
  return (
    member.fullName ||
    [member.firstName, member.lastName].filter(Boolean).join(" ") ||
    (member.id != null ? `پرسنل #${member.id}` : "پرسنل")
  );
}

export default function FinanceView() {
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const [date, setDate] = useState(todayGregorian());
  const [toast, setToast] = useState<DashboardToastState>(null);

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

  const offerings = useQueryCatalogOfferings(true).data?.data ?? [];
  const staff =
    useQueryStaffForOfferings(
      salonPublicId || undefined,
      offerings.map((o) => o.id),
      { enabled: offerings.length > 0 }
    ).data?.data ?? [];

  const tipsMutate = useMutateTips();
  const [tipStaffId, setTipStaffId] = useState<number | "">("");
  const [tipAmount, setTipAmount] = useState("");
  const [tipAppointmentId, setTipAppointmentId] = useState<number | "">("");

  const issueInvoice = async (appointmentId: number) => {
    try {
      const res = await invoiceMutations.createFromAppointment.mutateAsync(appointmentId);
      setToast({
        type: "success",
        message: `فاکتور ایجاد شد (شماره: ${res.data?.id ?? "-"})`,
      });
    } catch (err) {
      setToast({
        type: "error",
        message: getApiErrorMessage(err, "صدور فاکتور ناموفق بود."),
      });
    }
  };

  const submitPayment = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId || !amount) {
      setToast({ type: "error", message: "شماره فاکتور و مبلغ پرداخت الزامی است." });
      return;
    }
    try {
      const res = await paymentMutations.create.mutateAsync({
        invoiceId: Number(selectedInvoiceId),
        amount: Number(amount),
        paymentMethod,
        paymentType: PaymentType.Full,
      });
      setToast({
        type: "success",
        message: res.data?.isDuplicate
          ? "این پرداخت قبلا ثبت شده بود."
          : `پرداخت ثبت شد. مانده: ${formatToman(res.data?.invoiceOutstanding)}`,
      });
      setAmount("");
    } catch (err) {
      setToast({
        type: "error",
        message: getApiErrorMessage(err, "ثبت پرداخت ناموفق بود."),
      });
    }
  };

  const walletOp = async (type: "charge" | "debit") => {
    if (!customerId || !walletAmount) {
      setToast({ type: "error", message: "مشتری و مبلغ کیف پول الزامی است." });
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
        setToast({ type: "success", message: "کیف پول مشتری شارژ شد." });
      } else {
        await walletMutations.debit.mutateAsync(body);
        setToast({ type: "success", message: "از کیف پول مشتری برداشت شد." });
      }
      setWalletAmount("");
    } catch (err) {
      setToast({
        type: "error",
        message: getApiErrorMessage(err, "عملیات کیف پول ناموفق بود."),
      });
    }
  };

  const submitTip = async (e: FormEvent) => {
    e.preventDefault();
    if (!tipStaffId || !tipAmount) {
      setToast({ type: "error", message: "پرسنل و مبلغ انعام الزامی است." });
      return;
    }
    try {
      await tipsMutate.mutateAsync({
        staffMemberId: Number(tipStaffId),
        amount: Number(tipAmount),
        appointmentId: tipAppointmentId ? Number(tipAppointmentId) : undefined,
      });
      setToast({ type: "success", message: "انعام ثبت شد." });
      setTipAmount("");
      setTipAppointmentId("");
    } catch (err) {
      setToast({
        type: "error",
        message: getApiErrorMessage(err, "ثبت انعام ناموفق بود."),
      });
    }
  };

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="مالی"
        description="صدور فاکتور، پرداخت، کیف پول و انعام."
      />

      <DashboardCard>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-foreground">صدور فاکتور</h2>
          <div className="w-[170px]">
            <DashboardDateField name="finance-day" value={date} onChange={setDate} />
          </div>
        </div>
        <div className="space-y-2">
          {completedAppointments.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-2 rounded-[12px] border border-border p-3"
            >
              <span className="text-xs text-foreground-muted">
                نوبت #{a.id} · {a.staffNames || "بدون پرسنل"}
              </span>
              <Button size="sm" onClick={() => issueInvoice(a.id)}>
                صدور فاکتور
              </Button>
            </div>
          ))}
          {completedAppointments.length === 0 ? (
            <p className="text-xs text-foreground-muted">
              برای این تاریخ نوبت تکمیل‌شده‌ای نیست.
            </p>
          ) : null}
        </div>
      </DashboardCard>

      <DashboardCard>
        <h2 className="mb-3 text-sm font-bold text-foreground">ثبت پرداخت</h2>
        <form className="grid grid-cols-1 gap-2" onSubmit={submitPayment}>
          <DashboardSelect
            value={selectedInvoiceId}
            onChange={(e) => setSelectedInvoiceId(Number(e.target.value))}
          >
            <option value="">انتخاب فاکتور</option>
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                فاکتور #{inv.id} · مانده {formatToman(inv.outstandingAmount)}
              </option>
            ))}
          </DashboardSelect>
          <Input
            type="number"
            placeholder="مبلغ (تومان)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <DashboardSelect
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(Number(e.target.value))}
          >
            <option value={PaymentMethod.Cash}>نقدی</option>
            <option value={PaymentMethod.Card}>کارت</option>
            <option value={PaymentMethod.Online}>آنلاین</option>
            <option value={PaymentMethod.Transfer}>انتقال</option>
            <option value={PaymentMethod.Wallet}>کیف پول</option>
          </DashboardSelect>
          <Button type="submit" isLoading={paymentMutations.create.isPending}>
            ثبت پرداخت
          </Button>
        </form>
        <div className="mt-3 space-y-1">
          {payments.map((p, i) => (
            <p key={`${p.id}-${i}`} className="text-xs text-foreground-muted">
              پرداخت #{p.id} · {formatToman(p.amount)} تومان ·{" "}
              {paymentMethodLabel(p.paymentMethod)}
            </p>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard>
        <h2 className="mb-3 text-sm font-bold text-foreground">کیف پول مشتری</h2>
        <Input
          placeholder="جستجوی مشتری"
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
        />
        <DashboardSelect
          className="mt-2"
          value={customerId}
          onChange={(e) => setCustomerId(Number(e.target.value))}
        >
          <option value="">انتخاب مشتری</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.fullName} - {c.phone}
            </option>
          ))}
        </DashboardSelect>
        <p className="mt-3 text-lg font-bold text-foreground">
          {formatToman(walletQuery.data?.data?.balance)} تومان
        </p>
        <p className="text-[11px] text-foreground-muted">موجودی کیف پول</p>
        <div className="mt-3 flex gap-2">
          <Input
            type="number"
            placeholder="مبلغ"
            value={walletAmount}
            onChange={(e) => setWalletAmount(e.target.value)}
          />
          <Button size="sm" onClick={() => walletOp("charge")}>
            شارژ
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={dashboardQuietButtonClass}
            onClick={() => walletOp("debit")}
          >
            برداشت
          </Button>
        </div>
        <div className="mt-3 space-y-1">
          {(walletTxQuery.data?.data ?? []).slice(0, 5).map((t) => (
            <p key={t.id} className="text-xs text-foreground-muted">
              {formatToman(t.amount)} · {t.description || "بدون توضیح"}
            </p>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard>
        <h2 className="mb-3 text-sm font-bold text-foreground">ثبت انعام</h2>
        <form className="grid grid-cols-1 gap-2" onSubmit={submitTip}>
          <DashboardSelect
            value={tipStaffId}
            onChange={(e) =>
              setTipStaffId(e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">انتخاب پرسنل</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {staffLabel(member)}
              </option>
            ))}
          </DashboardSelect>
          <Input
            type="number"
            placeholder="مبلغ انعام (تومان)"
            value={tipAmount}
            onChange={(e) => setTipAmount(e.target.value)}
          />
          <DashboardSelect
            value={tipAppointmentId}
            onChange={(e) =>
              setTipAppointmentId(e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">نوبت (اختیاری)</option>
            {completedAppointments.map((a) => (
              <option key={a.id} value={a.id}>
                نوبت #{a.id} · {a.staffNames || "بدون پرسنل"}
              </option>
            ))}
          </DashboardSelect>
          <Button type="submit" isLoading={tipsMutate.isPending}>
            ثبت انعام
          </Button>
        </form>
      </DashboardCard>

      <DashboardToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardPage>
  );
}
