"use client";

import {
  StorefrontIcon,
  ChatCircleTextIcon,
  ChatCenteredDotsIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { useQueryAdminDashboardSummary } from "@/services/domains/admin/hooks/useQueryAdminDashboardSummary";
import { RouteAddress } from "@/shared/data/routeAddress";
import { AdminKpiCard } from "./_components/AdminKpiCard";

function KpiSkeleton() {
  return (
    <div className="h-[78px] animate-pulse rounded-xl border border-border bg-surface" />
  );
}

export default function AdminDashboardView() {
  const { data, isLoading, isError } = useQueryAdminDashboardSummary();
  const summary = data?.data;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">داشبورد</h1>
        <p className="mt-1 text-xs text-foreground-muted">
          نمای کلی از کارهای در انتظار پلتفرم.
        </p>
      </div>

      {isError ? (
        <p className="rounded-xl border border-error-border bg-error-background px-4 py-3 text-xs font-medium text-error">
          دریافت اطلاعات داشبورد با خطا مواجه شد.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {isLoading ? (
          <>
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
          </>
        ) : (
          <>
            <AdminKpiCard
              title="سالن‌های در انتظار تایید"
              value={summary?.pendingSalons ?? 0}
              icon={StorefrontIcon}
              tone="warning"
              href={RouteAddress.ADMIN.SALONS_PENDING}
            />
            <AdminKpiCard
              title="نظرات در انتظار تایید"
              value={summary?.pendingReviews ?? 0}
              icon={ChatCircleTextIcon}
              tone="warning"
            />
            <AdminKpiCard
              title="پاسخ‌های در انتظار تایید"
              value={summary?.pendingReplies ?? 0}
              icon={ChatCenteredDotsIcon}
              tone="warning"
            />
            <AdminKpiCard
              title="گزارش‌های باز"
              value={summary?.openReports ?? 0}
              icon={WarningIcon}
              tone="error"
            />
          </>
        )}
      </div>
    </div>
  );
}
