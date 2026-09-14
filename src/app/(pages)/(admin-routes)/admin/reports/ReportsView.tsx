"use client";

import { useState } from "react";
import { useQueryAdminPendingSalonReports } from "@/services/domains/salon-reports/hooks/useQueryAdminPendingSalonReports";
import { AdminPagination } from "../_components/AdminPagination";
import { AdminEmptyState } from "../_components/AdminEmptyState";
import { SalonReportCard } from "./components/SalonReportCard";

export default function ReportsView() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useQueryAdminPendingSalonReports({
    page,
    pageSize: 20,
  });

  const result = data?.data;
  const items = result?.items ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-lg font-bold text-foreground">گزارش‌های سوءرفتار</h1>
        <p className="mt-1 text-xs text-foreground-muted">
          گزارش‌های ثبت‌شده توسط مشتریان دربارهٔ سالن‌ها که هنوز باز هستند.
        </p>
      </div>

      {isError ? (
        <p className="rounded-xl border border-error-border bg-error-background px-4 py-3 text-xs font-medium text-error">
          دریافت لیست گزارش‌ها با خطا مواجه شد.
        </p>
      ) : null}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="h-28 animate-pulse rounded-xl border border-border bg-surface"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <AdminEmptyState
          title="گزارش بازی وجود ندارد"
          description="همهٔ گزارش‌های سوءرفتار بررسی شده‌اند."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((report) => (
            <SalonReportCard key={report.id} report={report} />
          ))}
        </div>
      )}

      {result && result.totalPages > 1 ? (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <AdminPagination
            page={result.page}
            totalPages={result.totalPages}
            hasNext={result.hasNext}
            hasPrevious={result.hasPrevious}
            onPageChange={setPage}
          />
        </div>
      ) : null}
    </div>
  );
}
