"use client";

import { Button } from "@/shared/components/primitives/button/Button";
import { useMutateNotifications, useQueryNotifications } from "@/services/domains/notifications/hooks";

interface IProps {
  title: string;
}

export default function NotificationsView({ title }: IProps) {
  const query = useQueryNotifications({ pageSize: 30 });
  const notifications = query.data?.data?.items ?? [];
  const mutate = useMutateNotifications();

  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-col gap-4 px-safe-area pb-24 pt-5">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-bold text-foreground">{title}</h1>
        <Button size="sm" variant="outline" onClick={() => mutate.readAll.mutate()}>
          خواندن همه
        </Button>
      </div>

      {query.isLoading ? (
        <p className="text-xs text-foreground-muted">در حال دریافت اعلان‌ها...</p>
      ) : query.isError ? (
        <p className="text-xs text-error">دریافت اعلان‌ها ناموفق بود.</p>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className="rounded-md border border-border p-3">
              <p className="text-sm font-bold text-foreground">
                {n.title || "اعلان جدید"}
              </p>
              <p className="mt-1 text-xs text-foreground-muted">
                {n.body || "—"}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-[11px] text-foreground-muted">
                  {n.createdAt ? new Date(n.createdAt).toLocaleString("fa-IR") : ""}
                </p>
                {!n.isRead ? (
                  <Button size="sm" onClick={() => mutate.read.mutate(n.id)}>
                    خواندم
                  </Button>
                ) : (
                  <span className="text-[11px] text-primary">خوانده شده</span>
                )}
              </div>
            </div>
          ))}
          {notifications.length === 0 ? (
            <p className="text-xs text-foreground-muted">اعلانی وجود ندارد.</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

