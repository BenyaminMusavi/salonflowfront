"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CalendarCheckIcon, CaretLeftIcon } from "@phosphor-icons/react";
import { AppointmentStatus } from "@/services/common/enums/domain-enums";
import { useQueryMyAppointments } from "@/services/domains/appointments/hooks";
import { RouteAddress } from "@/shared/data/routeAddress";
import { formatSalonDayTime, salonTodayYmd } from "@/shared/utils/salonTime";

/** «نوبت بعدی شما» — the customer's nearest upcoming appointment, one tap from its details. */
export default function HomeNextAppointment() {
  const { data } = useQueryMyAppointments({
    from: salonTodayYmd(),
    status: AppointmentStatus.Scheduled,
    page: 1,
    pageSize: 10,
  });

  const next = useMemo(() => {
    const now = Date.now();
    return [...(data?.data?.items ?? [])]
      .filter((a) => new Date(a.endTime).getTime() > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];
  }, [data]);

  if (!next) return null;

  const services = (next.services ?? []).map((s) => s.name).filter(Boolean).join("، ");

  return (
    <div className="px-safe-area">
      <Link
        href={RouteAddress.RESERVATION.DETAILS(next.id)}
        className="flex items-center gap-3 rounded-[20px] bg-surface-brand px-4 py-4 transition-colors active:opacity-90"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <CalendarCheckIcon size={24} weight="duotone" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold text-content-brand">نوبت بعدی شما</span>
          <span className="block truncate text-[15px] font-bold text-foreground">{next.salonName || "سالن"}</span>
          <span className="block truncate text-xs text-foreground-muted">
            {formatSalonDayTime(next.startTime, { relative: true })}
            {services ? ` · ${services}` : ""}
          </span>
        </span>
        <CaretLeftIcon size={18} className="shrink-0 text-content-brand" />
      </Link>
    </div>
  );
}
