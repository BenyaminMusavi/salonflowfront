"use client";

import { BellIcon, CalendarCheckIcon, CalendarDotsIcon } from "@phosphor-icons/react";
import { RouteAddress } from "@/shared/data/routeAddress";
import { DashboardPage, DashboardPageHeader } from "../_components";
import { PanelListGroup, PanelListRow } from "../_components/PanelList";

/** «من» — a staff member's own corner of the panel: their appointments and their schedule. */
export default function MeView() {
  const D = RouteAddress.DASHBOARD;

  return (
    <DashboardPage className="gap-6">
      <DashboardPageHeader title="من" />

      <PanelListGroup>
        <PanelListRow href={D.MY_APPOINTMENTS} icon={CalendarCheckIcon} label="نوبت‌های من" />
        <PanelListRow href={D.SCHEDULES} icon={CalendarDotsIcon} label="برنامه‌ی کاری من" />
        <PanelListRow href={D.NOTIFICATIONS} icon={BellIcon} label="اعلان‌ها" />
      </PanelListGroup>
    </DashboardPage>
  );
}
