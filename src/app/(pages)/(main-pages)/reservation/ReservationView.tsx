"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryMyAppointments } from "@/services/domains/appointments/hooks/useQueryMyAppointments";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { RouteAddress } from "@/shared/data/routeAddress";
import { getLoginHref } from "@/shared/utils/authRedirect";
import {
  AppointmentHistoryPanel,
  useAppointmentHistoryQuery,
} from "@/shared/components/composites/appointment-history/AppointmentHistoryPanel";

export default function ReservationView() {
  const router = useRouter();
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const { query, setFilter, setPage } = useAppointmentHistoryQuery();
  // GET /appointments/me accepts any valid token (global or salon context),
  // so no switch-context is needed to list the user's own bookings.
  const { data, isLoading, isFetching, error, refetch } =
    useQueryMyAppointments(query, { enabled: isLoggedIn });

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
            router.push(getLoginHref(RouteAddress.RESERVATION.BASE));
          }}
          className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          ورود
        </button>
      </div>
    );
  }

  const hasFilter = !!(query.from || query.to || query.status);

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

      <AppointmentHistoryPanel
        idPrefix="my-reservations"
        query={query}
        onFilterChange={setFilter}
        onPageChange={setPage}
        result={data?.data}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        fields={{ salon: true, staff: true }}
        itemHref={(item) => RouteAddress.RESERVATION.DETAILS(item.id)}
        emptyState={
          <div className="rounded-[20px] bg-surface p-6 text-center">
            <p className="text-sm text-foreground-muted">
              {hasFilter ? "نوبتی با این فیلتر پیدا نشد." : "هنوز نوبتی ندارید."}
            </p>
            {!hasFilter && (
              <Link
                href={RouteAddress.SEARCH.BASE}
                className="mt-4 inline-flex text-sm font-bold text-primary"
              >
                جستجوی سالن
              </Link>
            )}
          </div>
        }
      />
    </div>
  );
}
