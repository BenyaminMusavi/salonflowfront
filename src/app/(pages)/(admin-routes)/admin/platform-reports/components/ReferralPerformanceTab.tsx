"use client";

import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/shared/components/primitives/button/Button";
import { useQueryAdminReferralPerformance } from "@/services/domains/admin/hooks/useQueryAdminPlatformReports";
import { useMutateExportPlatformReport } from "@/services/domains/admin/hooks/useMutateExportPlatformReport";
import { formatToman } from "@/shared/utils/salonDisplay";
import { downloadBlob } from "@/shared/utils/downloadBlob";
import { AdminEmptyState } from "../../_components/AdminEmptyState";

export function ReferralPerformanceTab({ from, to }: { from: string; to: string }) {
  const { data, isLoading, isError } = useQueryAdminReferralPerformance({
    from: from || undefined,
    to: to || undefined,
  });
  const { mutateAsync: exportReport, isPending: isExporting } =
    useMutateExportPlatformReport();

  const result = data?.data;
  const byStatus = result?.byStatus ?? [];

  const handleExport = async () => {
    try {
      const blob = await exportReport({
        report: "referral-performance",
        from: from || undefined,
        to: to || undefined,
      });
      downloadBlob(blob, `referral-performance-${from || "all"}-${to || "all"}.csv`);
    } catch {
      /* silent — export failure isn't critical enough for a blocking UI */
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" isLoading={isExporting} onClick={handleExport}>
          <DownloadSimpleIcon size={16} />
          <span className="mr-1">خروجی CSV</span>
        </Button>
      </div>

      {isError ? (
        <p className="rounded-xl border border-error-border bg-error-background px-4 py-3 text-xs font-medium text-error">
          دریافت گزارش معرفی با خطا مواجه شد.
        </p>
      ) : null}

      {!isLoading && result ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-foreground-muted">مجموع روز پاداش اعطاشده</p>
            <p className="mt-1 text-xl font-bold text-foreground">
              {result.totalRewardDaysGranted.toLocaleString("fa-IR")} روز
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-foreground-muted">درآمد حاصل از دعوت‌شدگان</p>
            <p className="mt-1 text-xl font-bold text-foreground">
              {formatToman(result.inviteeRevenueGenerated)} تومان
            </p>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[360px] text-right text-[13px]">
            <thead>
              <tr className="border-b border-border bg-background-secondary text-[11px] text-foreground-muted">
                <th className="px-4 py-3 font-semibold">وضعیت</th>
                <th className="px-4 py-3 font-semibold">تعداد</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-border last:border-0">
                    <td className="px-4 py-3" colSpan={2}>
                      <div className="h-4 w-full animate-pulse rounded bg-background-secondary" />
                    </td>
                  </tr>
                ))
              ) : byStatus.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-8">
                    <AdminEmptyState
                      title="داده‌ای برای این بازهٔ زمانی وجود ندارد"
                      description="بازهٔ تاریخ را تغییر دهید یا بعداً دوباره بررسی کنید."
                    />
                  </td>
                </tr>
              ) : (
                byStatus.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-border text-foreground last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">{row.status}</td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {row.count.toLocaleString("fa-IR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
