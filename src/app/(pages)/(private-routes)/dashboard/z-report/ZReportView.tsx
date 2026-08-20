"use client";

import { useState } from "react";
import { Input } from "@/shared/components/primitives/input/Input";
import { useQueryZReport } from "@/services/domains/reports/hooks";
import { formatToman } from "@/shared/utils/salonDisplay";

const toDateOnly = (d: Date) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function ZReportView() {
  const [date, setDate] = useState(toDateOnly(new Date()));
  const query = useQueryZReport(date);
  const data = query.data?.data;

  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-col gap-4 px-safe-area pb-8">
      <div className="rounded-lg bg-surface-secondary p-3">
        <h1 className="mb-2 text-base font-bold text-foreground">Z-Report روزانه</h1>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-10 min-h-10"
          inputWrapperClassname="w-[160px]"
        />
      </div>

      {query.isLoading ? (
        <p className="text-sm text-foreground-muted">در حال دریافت گزارش...</p>
      ) : query.isError ? (
        <p className="text-sm text-error">دریافت گزارش ناموفق بود.</p>
      ) : data ? (
        <div className="rounded-lg bg-surface-secondary p-3 text-sm text-foreground">
          <p>پرداخت نقدی: {formatToman(data.cashTotal)} تومان</p>
          <p>پرداخت کارت: {formatToman(data.cardTotal)} تومان</p>
          <p>پرداخت آنلاین: {formatToman(data.onlineTotal)} تومان</p>
          <p>مجموع صندوق (نقد+کارت+آنلاین): {formatToman(data.paymentsTotal)} تومان</p>
          {data.transferTotal != null ? (
            <p>انتقال: {formatToman(data.transferTotal)} تومان</p>
          ) : null}
          {data.walletTotal != null ? (
            <p>کیف پول: {formatToman(data.walletTotal)} تومان</p>
          ) : null}
          {data.collectedTotal != null ? (
            <p>جمع همه روش‌های Paid: {formatToman(data.collectedTotal)} تومان</p>
          ) : null}
          <p>مجموع انعام: {formatToman(data.tipsTotal)} تومان</p>
          <p>جمع کمیسیون پرسنل: {formatToman(data.staffCommissionTotal)} تومان</p>
          <div className="mt-3 space-y-1">
            {(data.staffCommissions ?? []).map((row) => (
              <p key={row.staffMemberId} className="text-xs text-foreground-muted">
                {row.staffName}: {formatToman(row.commissionTotal)} تومان
              </p>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-foreground-muted">داده‌ای برای این روز ثبت نشده است.</p>
      )}
    </div>
  );
}

