"use client";

import { useState } from "react";
import { useQueryZReport } from "@/services/domains/reports/hooks";
import { formatToman } from "@/shared/utils/salonDisplay";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import {
  DashboardCard,
  DashboardDateField,
  DashboardEmptyState,
  DashboardKpi,
  DashboardPage,
  DashboardPageHeader,
  DashboardSkeleton,
  todayGregorian,
} from "../_components";

export default function ZReportView() {
  const [date, setDate] = useState(todayGregorian());
  const query = useQueryZReport(date);
  const data = query.data?.data;

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Z-Report"
        description="جمع صندوق و کمیسیون همان روز."
      />

      <DashboardCard>
        <DashboardDateField name="z-report-day" value={date} onChange={setDate} />
      </DashboardCard>

      {query.isLoading ? (
        <DashboardSkeleton cards={2} rows={2} />
      ) : query.isError ? (
        <DashboardEmptyState
          title="دریافت گزارش ناموفق بود"
          description={getApiErrorMessage(query.error, "دریافت گزارش ناموفق بود.")}
        />
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            <DashboardKpi title="نقد" value={`${formatToman(data.cashTotal)} تومان`} />
            <DashboardKpi title="کارت" value={`${formatToman(data.cardTotal)} تومان`} />
            <DashboardKpi title="آنلاین" value={`${formatToman(data.onlineTotal)} تومان`} />
            <DashboardKpi
              title="صندوق"
              value={`${formatToman(data.paymentsTotal)} تومان`}
            />
          </div>
          <DashboardCard>
            {data.transferTotal != null ? (
              <p className="text-sm text-foreground">
                انتقال: {formatToman(data.transferTotal)} تومان
              </p>
            ) : null}
            {data.walletTotal != null ? (
              <p className="mt-1 text-sm text-foreground">
                کیف پول: {formatToman(data.walletTotal)} تومان
              </p>
            ) : null}
            {data.collectedTotal != null ? (
              <p className="mt-1 text-sm text-foreground">
                جمع دریافت: {formatToman(data.collectedTotal)} تومان
              </p>
            ) : null}
            <p className="mt-1 text-sm text-foreground">
              انعام: {formatToman(data.tipsTotal)} تومان
            </p>
            <p className="mt-1 text-sm font-bold text-foreground">
              کمیسیون پرسنل: {formatToman(data.staffCommissionTotal)} تومان
            </p>
            <div className="mt-3 space-y-1">
              {(data.staffCommissions ?? []).map((row) => (
                <p key={row.staffMemberId} className="text-xs text-foreground-muted">
                  {row.staffName}: {formatToman(row.commissionTotal)} تومان
                </p>
              ))}
            </div>
          </DashboardCard>
        </>
      ) : (
        <DashboardEmptyState
          title="داده‌ای برای این روز نیست"
          description="تاریخ دیگری را انتخاب کنید یا بعد از ثبت پرداخت دوباره بیایید."
        />
      )}
    </DashboardPage>
  );
}
