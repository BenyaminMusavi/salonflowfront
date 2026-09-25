"use client";

import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/shared/components/primitives/button/Button";
import { useQueryAdminPromoPerformance } from "@/services/domains/admin/hooks/useQueryAdminPlatformReports";
import { useMutateExportPlatformReport } from "@/services/domains/admin/hooks/useMutateExportPlatformReport";
import { formatRialAsToman } from "@/services/domains/subscriptions/utils/subscription-display";
import { downloadBlob } from "@/shared/utils/downloadBlob";
import { AdminEmptyState } from "../../_components/AdminEmptyState";
import { APP_LOCALE } from "@/shared/utils/locale";

export function PromoPerformanceTab({ from, to }: { from: string; to: string }) {
  const { data, isLoading, isError } = useQueryAdminPromoPerformance({
    from: from || undefined,
    to: to || undefined,
  });
  const { mutateAsync: exportReport, isPending: isExporting } =
    useMutateExportPlatformReport();

  const items = data?.data?.items ?? [];

  const handleExport = async () => {
    try {
      const blob = await exportReport({
        report: "promo-performance",
        from: from || undefined,
        to: to || undefined,
      });
      downloadBlob(blob, `promo-performance-${from || "all"}-${to || "all"}.csv`);
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
          دریافت گزارش کدهای تخفیف با خطا مواجه شد.
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-right text-[13px]">
            <thead>
              <tr className="border-b border-border bg-background-secondary text-[11px] text-foreground-muted">
                <th className="px-4 py-3 font-semibold">کد تخفیف</th>
                <th className="px-4 py-3 font-semibold">تعداد استفاده</th>
                <th className="px-4 py-3 font-semibold">درآمد</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-border last:border-0">
                    <td className="px-4 py-3" colSpan={3}>
                      <div className="h-4 w-full animate-pulse rounded bg-background-secondary" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8">
                    <AdminEmptyState
                      title="داده‌ای برای این بازهٔ زمانی وجود ندارد"
                      description="بازهٔ تاریخ را تغییر دهید یا بعداً دوباره بررسی کنید."
                    />
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr
                    key={row.code}
                    className="border-b border-border text-foreground last:border-0"
                  >
                    <td className="px-4 py-3 font-medium" dir="ltr">
                      {row.code}
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {row.usageCount.toLocaleString(APP_LOCALE)}
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {formatRialAsToman(row.revenue)} تومان
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
