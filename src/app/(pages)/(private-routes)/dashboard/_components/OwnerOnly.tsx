"use client";

import Link from "next/link";
import { RouteAddress } from "@/shared/data/routeAddress";
import { DashboardPage } from "./DashboardPage";
import { DashboardEmptyState } from "./DashboardEmptyState";
import { useIsSalonStaff } from "./useIsSalonStaff";

/**
 * Renders `children` only for the salon owner. Staff reaching an owner-only page (old link,
 * typed URL) get a plain notice instead of a page whose every action the backend rejects.
 */
export function OwnerOnly({ children }: { children: React.ReactNode }) {
  const isStaff = useIsSalonStaff();
  if (!isStaff) return <>{children}</>;

  return (
    <DashboardPage>
      <DashboardEmptyState
        title="این بخش مخصوص سالن‌دار است"
        description="نوبت‌ها، مشتریان و برنامه‌ی خودتان را از منوی پایین ببینید."
        action={
          <Link
            href={RouteAddress.DASHBOARD.BASE}
            className="text-sm font-semibold text-primary"
          >
            رفتن به نوبت‌ها
          </Link>
        }
      />
    </DashboardPage>
  );
}
