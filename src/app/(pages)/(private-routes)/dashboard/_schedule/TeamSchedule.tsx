"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { CaretLeftIcon } from "@phosphor-icons/react";
import workingSchedulesService from "@/services/domains/working-schedules/working-schedules.service";
import specialSchedulesService from "@/services/domains/special-schedules/special-schedules.service";
import { WORKING_SCHEDULES_QUERY_KEY } from "@/services/domains/working-schedules/hooks";
import { SPECIAL_SCHEDULES_QUERY_KEY } from "@/services/domains/special-schedules/hooks";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { RouteAddress } from "@/shared/data/routeAddress";
import { addDaysYmd, formatSalonDate, salonTodayYmd, salonWeekday, ymdToDate } from "@/shared/utils/salonTime";
import { cn } from "@/shared/utils/className";
import type { ISalonStaffMember } from "../_staff/useSalonStaff";
import { hhmm } from "./scheduleUtils";

const DAYS_AHEAD = 7;

const chip = (active: boolean) =>
  cn(
    "flex shrink-0 flex-col items-center rounded-[12px] px-3 py-1.5 text-xs font-semibold transition-colors",
    active ? "bg-primary text-primary-foreground" : "bg-surface-hover text-foreground-muted"
  );

/** JS weekday (0 = Sunday) → API weekday (0 = Saturday). */
const apiWeekday = (ymd: string) => (salonWeekday(ymdToDate(ymd)) + 1) % 7;

/** «امروز چه کسی سر کار است؟» — each person's hours for a day in the coming week. */
export function TeamSchedule({ members }: { members: ISalonStaffMember[] }) {
  const salonId = useSalonContextStore((s) => s.salonId);
  const today = salonTodayYmd();
  const days = useMemo(() => Array.from({ length: DAYS_AHEAD }, (_, i) => addDaysYmd(today, i)), [today]);
  const [day, setDay] = useState(today);
  const people = members.filter((m) => m.staffMemberId != null);
  const range = { from: day, to: day };

  const weekly = useQueries({
    queries: people.map((m) => ({
      queryKey: [WORKING_SCHEDULES_QUERY_KEY, salonId, m.staffMemberId],
      queryFn: () => workingSchedulesService.listByStaff(m.staffMemberId!),
      enabled: !!salonId,
    })),
  });
  const special = useQueries({
    queries: people.map((m) => ({
      queryKey: [SPECIAL_SCHEDULES_QUERY_KEY, salonId, m.staffMemberId, range],
      queryFn: () => specialSchedulesService.listByStaff(m.staffMemberId!, range),
      enabled: !!salonId,
    })),
  });

  const rows = people.map((m, i) => {
    const exception = (special[i].data?.data ?? []).find((x) => x.date.slice(0, 10) === day);
    const regular = (weekly[i].data?.data ?? []).find((x) => x.dayOfWeek === apiWeekday(day));
    const loading = weekly[i].isLoading;
    let hours: string;
    let off = false;
    if (exception) {
      off = exception.isOffDay;
      hours = exception.isOffDay
        ? exception.note || "مرخصی"
        : `${hhmm(exception.startTime)} تا ${hhmm(exception.endTime)} · ساعت متفاوت`;
    } else if (!regular || regular.isOffDay) {
      off = true;
      hours = "تعطیل";
    } else {
      hours = `${hhmm(regular.startTime)} تا ${hhmm(regular.endTime)}`;
    }
    return { member: m, hours, off, loading };
  });
  const working = rows.filter((r) => !r.off).length;

  return (
    <section className="flex flex-col gap-3">
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {days.map((d, i) => (
          <button key={d} type="button" className={chip(d === day)} onClick={() => setDay(d)}>
            <span>{i === 0 ? "امروز" : i === 1 ? "فردا" : formatSalonDate(ymdToDate(d), { weekday: "short" })}</span>
            <span className="text-[10px] font-normal tabular-nums opacity-80">
              {formatSalonDate(ymdToDate(d), { day: "numeric", month: "short" })}
            </span>
          </button>
        ))}
      </div>
      <p className="px-1 text-xs text-foreground-muted">
        {working} نفر از {people.length} نفر سر کار
      </p>
      <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
        {rows.map(({ member, hours, off, loading }) => (
          <Link
            key={member.publicId}
            href={RouteAddress.DASHBOARD.STAFF_DETAILS(member.publicId)}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-hover"
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                off ? "bg-surface-hover text-foreground-muted" : "bg-surface-brand text-content-brand"
              )}
            >
              {member.name.charAt(0)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-foreground">{member.name}</span>
              <span className={cn("block truncate text-xs tabular-nums", off ? "text-foreground-muted" : "text-foreground")}>
                {loading ? "…" : hours}
              </span>
            </span>
            <CaretLeftIcon size={16} className="shrink-0 text-foreground-muted" />
          </Link>
        ))}
      </div>
    </section>
  );
}
