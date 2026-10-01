"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/shared/components/primitives/button/Button";
import { MoneyInput } from "@/shared/components/primitives/input/MoneyInput";
import { useQuerySalonAppointments } from "@/services/domains/appointments/hooks";
import { AppointmentStatus, PaymentMethod, PaymentType } from "@/services/common/enums/domain-enums";
import { useMutateInvoices, useQueryInvoices } from "@/services/domains/invoices/hooks";
import { useMutatePayments, useQueryPaymentsByInvoice } from "@/services/domains/payments/hooks";
import { useMutateTips } from "@/services/domains/tips/hooks";
import { useQueryCatalogOfferings } from "@/services/domains/catalog/hooks";
import { useQueryStaffForOfferings } from "@/services/domains/staff-profile/hooks/useQueryStaffForOfferings";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { formatToman } from "@/shared/utils/salonDisplay";
import { paymentMethodLabel } from "@/services/domains/reports/utils/report-display";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import {
  validateRecordPayment,
  type TPaymentFieldErrors,
} from "@/services/domains/payments/utils/paymentValidation";
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

function staffLabel(member: { staffMemberId: number; firstName?: string | null }) {
  return member.firstName || `پرسنل #${member.staffMemberId}`;
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
  const [paymentErrors, setPaymentErrors] = useState<TPaymentFieldErrors>({});

  const offerings = useQueryCatalogOfferings(true).data?.data ?? [];
  const staff =
    useQueryStaffForOfferings(
      salonPublicId || undefined,
      offerings.map((o) => o.publicId),
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

    const fieldErrors = validateRecordPayment({
      invoiceId: Number(selectedInvoiceId) || 0,
      amount: Number(amount) || 0,
      paymentMethod,
      paymentType: PaymentType.Full,
    });
    if (fieldErrors) {
      setPaymentErrors(fieldErrors);
      return;
    }
    setPaymentErrors({});

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
        description="صدور فاکتور، پرداخت و انعام."
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
              key={a.numericId}
              className="flex items-center justify-between gap-2 rounded-[12px] border border-border p-3"
            >
              <span className="text-xs text-foreground-muted">
                نوبت #{a.numericId} · {a.staffNames || "بدون پرسنل"}
              </span>
              <Button size="sm" onClick={() => issueInvoice(a.numericId)}>
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
          <div>
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
            {paymentErrors.invoiceId && (
              <p className="mt-1 text-xs font-medium text-error">
                {paymentErrors.invoiceId}
              </p>
            )}
          </div>
          <div>
            <MoneyInput
              placeholder="مبلغ"
              value={amount}
              onValueChange={(v) => setAmount(v == null ? "" : String(v))}
              hasError={!!paymentErrors.amount}
            />
            {paymentErrors.amount && (
              <p className="mt-1 text-xs font-medium text-error">
                {paymentErrors.amount}
              </p>
            )}
          </div>
          <DashboardSelect
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(Number(e.target.value))}
          >
            <option value={PaymentMethod.Cash}>نقدی</option>
            <option value={PaymentMethod.Card}>کارت</option>
            <option value={PaymentMethod.Online}>آنلاین</option>
            <option value={PaymentMethod.Transfer}>انتقال</option>
            {/* Wallet is platform credit and disabled for now — salons never take payment from it. */}
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
              <option key={member.staffMemberId} value={member.staffMemberId}>
                {staffLabel(member)}
              </option>
            ))}
          </DashboardSelect>
          <MoneyInput
            placeholder="مبلغ انعام"
            value={tipAmount}
            onValueChange={(v) => setTipAmount(v == null ? "" : String(v))}
          />
          <DashboardSelect
            value={tipAppointmentId}
            onChange={(e) =>
              setTipAppointmentId(e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">نوبت (اختیاری)</option>
            {completedAppointments.map((a) => (
              <option key={a.numericId} value={a.numericId}>
                نوبت #{a.numericId} · {a.staffNames || "بدون پرسنل"}
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
