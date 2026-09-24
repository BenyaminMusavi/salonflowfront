"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQueryCustomerAppointments } from "@/services/domains/appointments/hooks";
import {
  AppointmentHistoryPanel,
  useAppointmentHistoryQuery,
} from "@/shared/components/composites/appointment-history/AppointmentHistoryPanel";
import { RouteAddress } from "@/shared/data/routeAddress";
import { DashboardPage, DashboardPageHeader } from "../../_components";

/** «رزروهای مشتری» — one customer's appointments in the current salon (SalonOwner/Staff). */
export default function CustomerAppointmentsView() {
  const params = useParams<{ customerPublicId: string }>();
  const customerPublicId = params?.customerPublicId;
  const { query, setFilter, setPage } = useAppointmentHistoryQuery();
  const { data, isLoading, isFetching, error } = useQueryCustomerAppointments(
    customerPublicId,
    query
  );
  const customerName = data?.data?.items?.[0]?.customerName;

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="رزروهای مشتری"
        description={customerName ?? undefined}
        action={
          <Link
            href={RouteAddress.DASHBOARD.CUSTOMERS}
            className="text-xs font-semibold text-primary"
          >
            بازگشت به مشتریان
          </Link>
        }
      />
      <AppointmentHistoryPanel
        idPrefix="customer-appointments"
        query={query}
        onFilterChange={setFilter}
        onPageChange={setPage}
        result={data?.data}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        fields={{ staff: true }}
      />
    </DashboardPage>
  );
}
