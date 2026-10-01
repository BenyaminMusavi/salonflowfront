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
import { useMyStaffMember } from "../_staff/useMyStaffMember";

const chip = (active: boolean) =>
  cn(
    "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
    active ? "bg-primary text-primary-foreground" : "bg-surface-hover text-foreground-muted"
  );

/**
 * Working schedule. Staff land straight on their own («برنامه‌ی من»); the owner picks a person
 * (each person's page has the same editor under «برنامه»).
 */
export default function SchedulesView() {
  const isStaff = useIsSalonStaff();
  const { me, staff, isLoading } = useMyStaffMember();
  const [toast, setToast] = useState<DashboardToastState>(null);
  const [pickedId, setPickedId] = useState<number | null>(null);

  useEffect(() => {
    if (pickedId != null) return;
    if (isStaff && me) setPickedId(me.staffMemberId);
    else if (!isStaff && staff.length > 0) setPickedId(staff[0].staffMemberId);
  }, [isStaff, me, staff, pickedId]);

  // Staff only switch people when we could not tell which profile is theirs.
  const showPicker = !isStaff || !me;

  return (
    <DashboardPage className="gap-5">
      <DashboardPageHeader
        title={isStaff ? "برنامه‌ی کاری من" : "برنامه‌ی کاری پرسنل"}
        backHref={isStaff ? RouteAddress.DASHBOARD.ME : RouteAddress.DASHBOARD.SALON}
      />

      {isLoading ? (
        <DashboardSkeleton cards={1} rows={5} />
      ) : staff.length === 0 ? (
        <p className="rounded-[16px] bg-background-secondary p-6 text-center text-sm text-foreground-muted">
          هنوز پرسنلی با خدمت فعال نیست.
        </p>
      ) : (
        <>
          {showPicker ? (
            <div className="flex flex-col gap-2">
              {isStaff ? (
                <p className="px-1 text-xs text-foreground-muted">
                  خودتان را انتخاب کنید. برنامه‌ی همکاران را فقط می‌توانید ببینید.
                </p>
              ) : null}
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
