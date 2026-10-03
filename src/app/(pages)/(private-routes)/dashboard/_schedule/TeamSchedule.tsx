"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { useQueryTeamSchedule } from "@/services/domains/staff/hooks";
import { RouteAddress } from "@/shared/data/routeAddress";
import { APP_LOCALE } from "@/shared/utils/locale";
import { addDaysYmd, formatSalonDate, salonTodayYmd, ymdToDate } from "@/shared/utils/salonTime";
import { cn } from "@/shared/utils/className";
import { hhmm } from "./scheduleUtils";

const DAYS_AHEAD = 7;

const chip = (active: boolean) =>
  cn(
    "flex shrink-0 flex-col items-center rounded-[12px] px-3 py-1.5 text-xs font-semibold transition-colors",
    active ? "bg-primary text-primary-foreground" : "bg-surface-hover text-foreground-muted"
  );

/** «امروز چه کسی سر کار است؟» — each person's hours for a day in the coming week (`GET /api/schedules/team`). */
export function TeamSchedule() {
  const today = salonTodayYmd();
  const days = useMemo(() => Array.from({ length: DAYS_AHEAD }, (_, i) => addDaysYmd(today, i)), [today]);
  const [day, setDay] = useState(today);
  const query = useQueryTeamSchedule(days[0], days[days.length - 1]);

  const rows = (query.data?.data ?? []).map((row) => {
    const d = row.days.find((x) => x.date.slice(0, 10) === day);
    const off = !d || d.isOff || d.ranges.length === 0;
    const hours = off
      ? d?.isException
        ? "مرخصی"
        : "تعطیل"
      : [
          d.ranges.map((r) => `${hhmm(r.start)} تا ${hhmm(r.end)}`).join("، "),
          d.isException ? "ساعت متفاوت" : null,
          d.appointmentsCount ? `${d.appointmentsCount.toLocaleString(APP_LOCALE)} نوبت` : null,
        ]
          .filter(Boolean)
          .join(" · ");
    return { staff: row.staff, name: row.staff.fullName?.trim() || "پرسنل", hours, off };
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
      {query.isLoading ? (
        <div className="h-48 animate-pulse rounded-[16px] bg-background-secondary" />
      ) : query.isError ? (
        <p className="text-sm text-error">دریافت برنامه‌ی تیم ناموفق بود.</p>
      ) : (
        <>
          <p className="px-1 text-xs text-foreground-muted">
            {working.toLocaleString(APP_LOCALE)} نفر از {rows.length.toLocaleString(APP_LOCALE)} نفر سر کار
          </p>
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
            {rows.map(({ staff, name, hours, off }) => (
              <Link
                key={staff.publicId}
                href={RouteAddress.DASHBOARD.STAFF_DETAILS(staff.publicId)}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-hover"
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    off ? "bg-surface-hover text-foreground-muted" : "bg-surface-brand text-content-brand"
                  )}
                >
                  {name.charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">{name}</span>
                  <span className={cn("block truncate text-xs tabular-nums", off ? "text-foreground-muted" : "text-foreground")}>
                    {hours}
                  </span>
                </span>
                <CaretLeftIcon size={16} className="shrink-0 text-foreground-muted" />
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
