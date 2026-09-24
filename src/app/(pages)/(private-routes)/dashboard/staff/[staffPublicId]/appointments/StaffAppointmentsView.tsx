"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQueryStaffAppointments } from "@/services/domains/appointments/hooks";
import { useQueryStaffRoster } from "@/services/domains/salons/hooks/useQueryStaffRoster";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import {
  AppointmentHistoryPanel,
  useAppointmentHistoryQuery,
} from "@/shared/components/composites/appointment-history/AppointmentHistoryPanel";
import { RouteAddress } from "@/shared/data/routeAddress";
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardEmptyState,
  useIsSalonStaff,
} from "../../../_components";

/** «رزروهای پرسنل» — one staff member's appointments in the current salon (SalonOwner only). */
export default function StaffAppointmentsView() {
  const params = useParams<{ staffPublicId: string }>();
  const staffPublicId = params?.staffPublicId;
  const isStaff = useIsSalonStaff();
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);

  const { query, setFilter, setPage } = useAppointmentHistoryQuery();
  const { data, isLoading, isFetching, error } = useQueryStaffAppointments(
    staffPublicId,
    query,
    { enabled: !isStaff }
  );

  const roster = useQueryStaffRoster(
    !isStaff ? salonPublicId || undefined : undefined
  ).data?.data;
  const member = roster?.find((r) => r.publicId === staffPublicId);
  const subtitle = member?.isCreator ? "شما (مالک سالن)" : member?.phoneNumber;

  const backLink = (
    <Link
      href={RouteAddress.DASHBOARD.STAFF}
      className="text-xs font-semibold text-primary"
    >
      بازگشت به پرسنل
    </Link>
  );

  if (isStaff) {
    return (
      <DashboardPage>
        <DashboardPageHeader title="رزروهای پرسنل" />
        <DashboardEmptyState
          title="دسترسی ندارید"
          description="فقط سالن‌دار رزروهای پرسنل را می‌بیند. نوبت‌های خودتان را از «نوبت‌های من» ببینید."
          action={
            <Link
              href={RouteAddress.DASHBOARD.MY_APPOINTMENTS}
              className="text-sm font-bold text-primary"
            >
              نوبت‌های من
            </Link>
          }
        />
      </DashboardPage>
    );
  }

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="رزروهای پرسنل"
        description={subtitle ?? undefined}
        action={backLink}
      />
      <AppointmentHistoryPanel
        idPrefix="staff-appointments"
        query={query}
        onFilterChange={setFilter}
        onPageChange={setPage}
        result={data?.data}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        fields={{ customer: true }}
      />
    </DashboardPage>
  );
}
