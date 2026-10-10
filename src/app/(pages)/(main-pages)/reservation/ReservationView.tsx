"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { AppointmentStatus } from "@/services/common/enums/domain-enums";
import { useQueryMyAppointments } from "@/services/domains/appointments/hooks/useQueryMyAppointments";
import type { IAppointmentHistoryItem } from "@/services/domains/appointments/types/appointments.type";
import {
  appointmentStatusClass,
  appointmentStatusLabel,
  formatAppointmentDateTime,
} from "@/services/domains/appointments/utils/appointment-display";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { RouteAddress } from "@/shared/data/routeAddress";
import { useRequireLogin } from "@/shared/hooks/useRequireLogin";
import { cn } from "@/shared/utils/className";
import { formatToman } from "@/shared/utils/salonDisplay";
import { salonTodayYmd } from "@/shared/utils/salonTime";

const PAGE_STEP = 20;
const UPCOMING = [AppointmentStatus.Scheduled, AppointmentStatus.CheckedIn] as number[];

const PAST_FILTERS: { value: number | null; label: string }[] = [
  { value: null, label: "همه" },
  { value: AppointmentStatus.Completed, label: "انجام شد" },
  { value: AppointmentStatus.Cancelled, label: "لغو شد" },
  { value: AppointmentStatus.NoShow, label: "مراجعه نکرد" },
];

const chip = (active: boolean) =>
  cn(
    "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
    active ? "bg-primary text-primary-foreground" : "bg-surface text-foreground-muted"
  );

function Row({ item }: { item: IAppointmentHistoryItem }) {
  const services = item.services?.map((s) => s.name).filter(Boolean).join("، ");
  return (
    <Link
      href={RouteAddress.RESERVATION.DETAILS(item.id)}
      className="flex items-center gap-3 rounded-[20px] bg-surface p-4 transition-colors hover:bg-surface-hover active:bg-surface-hover"
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-[15px] font-bold text-foreground">{item.salonName || "سالن"}</span>
          <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold", appointmentStatusClass(item.status))}>
            {appointmentStatusLabel(item.status)}
          </span>
        </span>
        <span className="mt-1 block text-[13px] font-semibold text-foreground">{formatAppointmentDateTime(item.startTime)}</span>
        <span className="mt-0.5 block truncate text-xs text-foreground-muted">
          {[services, item.staffNames, item.branchName].filter(Boolean).join(" · ")}
        </span>
        <span className="mt-0.5 block text-xs text-foreground-muted">{formatToman(item.totalPrice)} تومان</span>
      </span>
      <CaretLeftIcon size={18} className="shrink-0 text-foreground-muted" />
    </Link>
  );
}

/**
 * «نوبت‌های من»: «پیش‌رو» (booked / in the salon, soonest first) on top, «گذشته» below with a
 * status filter and «بیشتر». Opened from SMS links too: a guest goes to login and comes back.
 */
export default function ReservationView() {
  const { ready: isLoggedIn } = useRequireLogin(RouteAddress.RESERVATION.BASE);
  const today = salonTodayYmd();
  const [pastStatus, setPastStatus] = useState<number | null>(null);
  const [pastSize, setPastSize] = useState(PAGE_STEP);

  // GET /appointments/me is a customer endpoint: customer pages never send X-Salon-Id.
  const upcomingQuery = useQueryMyAppointments({ from: today, page: 1, pageSize: 50 }, { enabled: isLoggedIn });
  const pastQuery = useQueryMyAppointments(
    { to: today, status: pastStatus ?? undefined, page: 1, pageSize: pastSize },
    { enabled: isLoggedIn }
  );

  const upcoming = useMemo(() => {
    const now = Date.now();
    return (upcomingQuery.data?.data?.items ?? [])
      .filter((a) => UPCOMING.includes(Number(a.status)) && new Date(a.endTime).getTime() > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [upcomingQuery.data]);

  const upcomingIds = useMemo(() => new Set(upcoming.map((a) => a.id)), [upcoming]);
  const pastResult = pastQuery.data?.data;
  const past = useMemo(
    () =>
      (pastResult?.items ?? [])
        .filter((a) => !upcomingIds.has(a.id))
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()),
    [pastResult, upcomingIds]
  );

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center gap-4 px-safe-area pb-32 pt-10 text-center">
        <h1 className="text-lg font-bold text-foreground">نوبت‌های من</h1>
        <p className="text-sm text-foreground-muted">در حال بارگذاری…</p>
      </div>
    );
  }

  const loading = upcomingQuery.isLoading || pastQuery.isLoading;
  const error = upcomingQuery.error || pastQuery.error;
  const nothingAtAll = !loading && !error && upcoming.length === 0 && past.length === 0 && pastStatus == null;

  return (
    <div className="flex flex-col gap-5 px-safe-area pb-32 pt-6">
      <h1 className="text-lg font-bold text-foreground">نوبت‌های من</h1>

      {error ? (
        <p className="rounded-[16px] bg-error/10 px-4 py-3 text-sm text-error">
          {getApiErrorMessage(error, "دریافت نوبت‌ها ناموفق بود.")}
        </p>
      ) : null}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-[20px] bg-surface" />
          ))}
        </div>
      ) : nothingAtAll ? (
        <div className="rounded-[20px] bg-surface p-6 text-center">
          <p className="text-sm text-foreground-muted">هنوز نوبتی ندارید.</p>
          <Link href={RouteAddress.SEARCH.BASE} className="mt-4 inline-flex text-sm font-bold text-primary">
            جستجوی سالن
          </Link>
        </div>
      ) : (
        <>
          <section className="flex flex-col gap-2">
            <h2 className="px-1 text-sm font-bold text-foreground">پیش‌رو</h2>
            {upcoming.length === 0 ? (
              <div className="rounded-[20px] bg-surface p-4 text-sm text-foreground-muted">
                نوبت پیش‌رویی ندارید.{" "}
                <Link href={RouteAddress.SEARCH.BASE} className="font-bold text-primary">
                  رزرو نوبت
                </Link>
              </div>
            ) : (
              upcoming.map((item) => <Row key={item.id} item={item} />)
            )}
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="px-1 text-sm font-bold text-foreground">گذشته</h2>
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              {PAST_FILTERS.map((f) => (
                <button
                  key={f.label}
                  type="button"
                  className={chip(pastStatus === f.value)}
                  onClick={() => {
                    setPastStatus(f.value);
                    setPastSize(PAGE_STEP);
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {past.length === 0 ? (
              <p className="rounded-[20px] bg-surface p-4 text-sm text-foreground-muted">
                {pastStatus == null ? "هنوز نوبت گذشته‌ای ندارید." : "نوبتی با این وضعیت پیدا نشد."}
              </p>
            ) : (
              past.map((item) => <Row key={item.id} item={item} />)
            )}
            {pastResult?.hasNext && pastSize < 100 ? (
              <button
                type="button"
                disabled={pastQuery.isFetching}
                onClick={() => setPastSize((n) => Math.min(100, n + PAGE_STEP))}
                className="self-center rounded-full bg-surface px-5 py-2 text-xs font-semibold text-foreground disabled:opacity-50"
              >
                بیشتر
              </button>
            ) : null}
          </section>
        </>
      )}
    </div>
  );
}
