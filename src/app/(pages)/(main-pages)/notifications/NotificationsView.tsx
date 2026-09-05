"use client";

import { useRouter } from "next/navigation";
import { BellSimpleIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { useMutateNotifications, useQueryNotifications } from "@/services/domains/notifications/hooks";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { RouteAddress } from "@/shared/data/routeAddress";
import { getLoginHref } from "@/shared/utils/authRedirect";

interface IProps {
  title: string;
}

export default function NotificationsView({ title }: IProps) {
  const router = useRouter();
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const query = useQueryNotifications({ pageSize: 30, enabled: isLoggedIn });
  const notifications = query.data?.data?.items ?? [];
  const mutate = useMutateNotifications();

  if (!isLoggedIn) {
    return (
      <div className="mx-auto flex w-full max-w-[600px] flex-col items-center gap-4 px-safe-area pb-32 pt-10 text-center">
        <h1 className="text-sm font-bold text-foreground">{title}</h1>
        <p className="text-sm text-foreground-muted">
          برای مشاهده اعلان‌ها وارد حساب کاربری شوید.
        </p>
        <button
          type="button"
          onClick={() => {
            router.push(getLoginHref(RouteAddress.NOTIFICATIONS.BASE));
          }}
          className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          ورود
        </button>
      </div>
    );
  }

  const hasUnread = notifications.some((n) => !n.readAt);

  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-col gap-4 px-safe-area pb-32 pt-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">{title}</h1>
        <button
          type="button"
          disabled={!hasUnread || mutate.readAll.isPending}
          onClick={() => mutate.readAll.mutate()}
          className="text-xs font-bold text-primary disabled:opacity-40"
        >
          {mutate.readAll.isPending ? "در حال ثبت…" : "خواندن همه"}
        </button>
      </div>

      {query.isLoading ? (
        <p className="text-sm text-foreground-muted">در حال دریافت اعلان‌ها…</p>
      ) : query.isError ? (
        <p className="text-sm text-error">دریافت اعلان‌ها ناموفق بود.</p>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[20px] bg-surface p-8 text-center">
          <BellSimpleIcon size={28} className="text-foreground-muted" />
          <p className="text-sm text-foreground-muted">اعلانی وجود ندارد.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => {
            const unread = !n.readAt;
            return (
              <div
                key={n.id}
                className={
                  unread
                    ? "rounded-[20px] bg-surface-tertiary p-4 ring-1 ring-primary/30"
                    : "rounded-[20px] bg-surface p-4"
                }
              >
                <div className="flex items-start gap-2">
                  {unread && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground">
                      {n.title || "اعلان جدید"}
                    </p>
                    <p className="mt-1 text-xs text-foreground-muted">
                      {n.body || "—"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-[11px] text-foreground-muted">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString("fa-IR") : ""}
                  </p>
                  {unread ? (
                    <button
                      type="button"
                      disabled={mutate.read.isPending}
                      onClick={() => mutate.read.mutate(n.id)}
                      className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground disabled:opacity-40"
                    >
                      خواندم
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] text-foreground-muted">
                      <CheckCircleIcon size={14} weight="fill" className="text-primary" />
                      خوانده شده
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

