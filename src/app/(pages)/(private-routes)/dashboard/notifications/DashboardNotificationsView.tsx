"use client";

import { Button } from "@/shared/components/primitives/button/Button";
import {
  useMutateNotifications,
  useQueryNotifications,
} from "@/services/domains/notifications/hooks";
import {
  DashboardCard,
  DashboardEmptyState,
  DashboardPage,
  DashboardPageHeader,
  DashboardSkeleton,
} from "../_components";
import { dashboardQuietButtonClass } from "../_components/buttonClasses";

export default function DashboardNotificationsView() {
  const query = useQueryNotifications({ pageSize: 30 });
  const notifications = query.data?.data?.items ?? [];
  const mutate = useMutateNotifications();

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="اعلان‌ها"
        description="پیام‌های پنل سالن‌دار"
        action={
          <Button
            size="sm"
            variant="outline"
            className={dashboardQuietButtonClass}
            onClick={() => mutate.readAll.mutate()}
          >
            خواندن همه
          </Button>
        }
      />

      {query.isLoading ? (
        <DashboardSkeleton cards={1} rows={4} />
      ) : query.isError ? (
        <DashboardEmptyState title="دریافت اعلان‌ها ناموفق بود" />
      ) : notifications.length === 0 ? (
        <DashboardEmptyState
          title="اعلانی وجود ندارد"
          description="وقتی رویداد جدیدی در سالن رخ دهد اینجا دیده می‌شود."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <DashboardCard key={n.id} className="p-3">
              <p className="text-sm font-bold text-foreground">
                {n.title || "اعلان جدید"}
              </p>
              <p className="mt-1 text-xs text-foreground-muted">{n.body || "—"}</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-[11px] text-foreground-muted">
                  {n.createdAt
                    ? new Date(n.createdAt).toLocaleString("fa-IR")
                    : ""}
                </p>
                {!n.readAt ? (
                  <Button size="sm" onClick={() => mutate.read.mutate(n.id)}>
                    خواندم
                  </Button>
                ) : (
                  <span className="text-[11px] text-primary">خوانده شده</span>
                )}
              </div>
            </DashboardCard>
          ))}
        </div>
      )}
    </DashboardPage>
  );
}
