"use client";

import { useEffect, useState } from "react";
import { RouteAddress } from "@/shared/data/routeAddress";
import { cn } from "@/shared/utils/className";
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardSkeleton,
  DashboardToast,
  useIsSalonStaff,
  type DashboardToastState,
} from "../_components";
import { WeeklyScheduleEditor } from "../_schedule/WeeklyScheduleEditor";
import { SpecialDaysEditor } from "../_schedule/SpecialDaysEditor";
import { TeamSchedule } from "../_schedule/TeamSchedule";
import { useMyStaffMember } from "../_staff/useMyStaffMember";
import { useSalonStaff } from "../_staff/useSalonStaff";

const chip = (active: boolean) =>
  cn(
    "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
    active ? "bg-primary text-primary-foreground" : "bg-surface-hover text-foreground-muted"
  );

/** Owner: who works which day; each person's editor lives on their staff page. */
function TeamSchedulePage() {
  const { members, isLoading } = useSalonStaff();
  return (
    <DashboardPage className="gap-4">
      <DashboardPageHeader
        title="برنامه‌ی تیم"
        description="برای تغییر برنامه‌ی هر نفر، روی او بزنید."
        backHref={RouteAddress.DASHBOARD.SALON}
      />
      {isLoading ? <DashboardSkeleton cards={1} rows={5} /> : <TeamSchedule members={members} />}
    </DashboardPage>
  );
}

/** Staff: straight to their own schedule; colleagues are view-only (backend 403s their edits). */
function MySchedulePage() {
  const { me, staff, isLoading } = useMyStaffMember();
  const [toast, setToast] = useState<DashboardToastState>(null);
  const [pickedId, setPickedId] = useState<number | null>(null);

  useEffect(() => {
    if (pickedId == null && me) setPickedId(me.staffMemberId);
  }, [me, pickedId]);

  return (
    <DashboardPage className="gap-5">
      <DashboardPageHeader title="برنامه‌ی کاری من" backHref={RouteAddress.DASHBOARD.ME} />
      {isLoading ? (
        <DashboardSkeleton cards={1} rows={5} />
      ) : staff.length === 0 ? (
        <p className="rounded-[16px] bg-background-secondary p-6 text-center text-sm text-foreground-muted">
          هنوز خدمتی به شما داده نشده؛ از سالن‌دار بخواهید.
        </p>
      ) : (
        <>
          {!me ? (
            <div className="flex flex-col gap-2">
              <p className="px-1 text-xs text-foreground-muted">
                خودتان را انتخاب کنید. برنامه‌ی همکاران را فقط می‌توانید ببینید.
              </p>
              <div className="no-scrollbar flex gap-2 overflow-x-auto">
                {staff.map((s) => (
                  <button
                    key={s.staffMemberId}
                    type="button"
                    className={chip(pickedId === s.staffMemberId)}
                    onClick={() => setPickedId(s.staffMemberId)}
                  >
                    {s.firstName || "پرسنل"}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {pickedId != null ? (
            <div key={pickedId} className="flex flex-col gap-5">
              <WeeklyScheduleEditor staffMemberId={pickedId} onToast={setToast} />
              <SpecialDaysEditor staffMemberId={pickedId} onToast={setToast} />
            </div>
          ) : null}
        </>
      )}
      <DashboardToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardPage>
  );
}

export default function SchedulesView() {
  const isStaff = useIsSalonStaff();
  return isStaff ? <MySchedulePage /> : <TeamSchedulePage />;
}
