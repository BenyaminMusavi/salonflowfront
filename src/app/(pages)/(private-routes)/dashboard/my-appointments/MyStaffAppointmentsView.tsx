"use client";

import { useQueryMyStaffAppointments } from "@/services/domains/appointments/hooks";
import {
  AppointmentHistoryPanel,
  useAppointmentHistoryQuery,
} from "@/shared/components/composites/appointment-history/AppointmentHistoryPanel";
import { DashboardPage, DashboardPageHeader } from "../_components";

/** «نوبت‌های من» inside the salon — appointments of the current salon served by the caller (Staff or SalonOwner). */
export default function MyStaffAppointmentsView() {
  const { query, setFilter, setPage } = useAppointmentHistoryQuery();
  const { data, isLoading, isFetching, error } = useQueryMyStaffAppointments(query);

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="نوبت‌های من"
        description="نوبت‌هایی از این سالن که حداقل یک خدمتش با شماست."
      />
      <AppointmentHistoryPanel
        idPrefix="staff-me"
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
