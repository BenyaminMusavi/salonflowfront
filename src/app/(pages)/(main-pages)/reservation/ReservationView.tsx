"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryMyAppointments } from "@/services/domains/appointments/hooks/useQueryMyAppointments";
import {
  appointmentStatusClass,
  appointmentStatusLabel,
  formatAppointmentDateTime,
} from "@/services/domains/appointments/utils/appointment-display";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { RouteAddress } from "@/shared/data/routeAddress";
import { cn } from "@/shared/utils/className";

export default function ReservationView() {
  const router = useRouter();
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const setRedirectUrl = useTokenStore((s) => s.setRedirectUrl);
  const { data, isLoading, isError, refetch, isFetching } =
    useQueryMyAppointments();

  const appointments = data?.data ?? [];

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center gap-4 px-safe-area pb-32 pt-10 text-center">
        <h1 className="text-lg font-bold text-foreground">نوبت‌های من</h1>
        <p className="text-sm text-foreground-muted">
          برای مشاهده نوبت‌ها وارد حساب کاربری شوید.
        </p>
        <button
          type="button"
          onClick={() => {
            setRedirectUrl(RouteAddress.RESERVATION.BASE);
            router.push(RouteAddress.AUTH.LOGIN.BASE);
          }}
          className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          ورود
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-safe-area pb-32 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">نوبت‌های من</h1>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-xs text-primary disabled:opacity-40"
        >
          بروزرسانی
        </button>
      </div>

      {isLoading && (
        <p className="text-sm text-foreground-muted">در حال بارگذاری…</p>
      )}

      {isError && (
        <p className="text-sm text-error">خطا در دریافت نوبت‌ها</p>
      )}

      {!isLoading && !isError && appointments.length === 0 && (
        <div className="rounded-[20px] bg-surface-tertiary p-6 text-center">
          <p className="text-sm text-foreground-muted">هنوز نوبتی ندارید.</p>
          <Link
            href={RouteAddress.SEARCH.BASE}
            className="mt-4 inline-flex text-sm font-bold text-primary"
          >
            جستجوی سالن
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {appointments.map((item) => (
          <Link
            key={item.id}
            href={RouteAddress.RESERVATION.DETAILS(item.id)}
            className="rounded-[20px] bg-surface-tertiary p-4 transition hover:bg-surface"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[15px] font-bold text-foreground">
                  {item.salonName}
                </p>
                <p className="mt-1 text-xs text-foreground-muted">
                  {formatAppointmentDateTime(item.startTime)}
                </p>
                {item.staffNames && (
                  <p className="mt-1 text-xs text-foreground-muted">
                    {item.staffNames}
                  </p>
                )}
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                  appointmentStatusClass(item.status)
                )}
              >
                {appointmentStatusLabel(item.status)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
