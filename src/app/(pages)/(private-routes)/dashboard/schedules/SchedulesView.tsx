"use client";

import { useState } from "react";
import { RouteAddress } from "@/shared/data/routeAddress";
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

/** Owner: who works which day; each person's editor lives on their staff page. */
function TeamSchedulePage() {
  return (
    <DashboardPage className="gap-4">
      <DashboardPageHeader
        title="برنامه‌ی تیم"
        description="برای تغییر برنامه‌ی هر نفر، روی او بزنید."
        backHref={RouteAddress.DASHBOARD.SALON}
      />
      <TeamSchedule />
    </DashboardPage>
  );
}

/** Staff: straight to their own schedule (`GET /api/staff/me` says which row is theirs). */
function MySchedulePage() {
  const { me, isLoading } = useMyStaffMember();
  const [toast, setToast] = useState<DashboardToastState>(null);

  return (
    <DashboardPage className="gap-5">
      <DashboardPageHeader title="برنامه‌ی کاری من" backHref={RouteAddress.DASHBOARD.ME} />
      {isLoading ? (
        <DashboardSkeleton cards={1} rows={5} />
      ) : !me?.staffPublicId ? (
        <p className="rounded-[16px] bg-background-secondary p-6 text-center text-sm text-foreground-muted">
          شما در پرسنل این سالن نیستید؛ از سالن‌دار بخواهید شما را اضافه کند.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          <WeeklyScheduleEditor staffMemberId={me.staffMemberId} staffPublicId={me.staffPublicId} onToast={setToast} />
          <SpecialDaysEditor staffMemberId={me.staffMemberId} staffPublicId={me.staffPublicId} onToast={setToast} />
        </div>
      )}
      <DashboardToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardPage>
  );
}

export default function SchedulesView() {
  const isStaff = useIsSalonStaff();
  return isStaff ? <MySchedulePage /> : <TeamSchedulePage />;
}
