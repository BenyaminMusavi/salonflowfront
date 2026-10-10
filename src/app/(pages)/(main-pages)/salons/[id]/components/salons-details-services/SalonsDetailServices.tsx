"use client";

import Link from "next/link";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { useQueryBranchServices } from "@/services/domains/salons/hooks/useQueryBranchServices";
import type { ISalonBranch } from "@/services/domains/salons/types/booking-browse.type";
import { ISalonServiceSummary } from "@/services/domains/salons/types/salon.type";
import { RouteAddress } from "@/shared/data/routeAddress";
import { getServiceTypeIcon } from "@/shared/data/serviceTypeIcons";
import { APP_LOCALE } from "@/shared/utils/locale";
import { formatToman } from "@/shared/utils/salonDisplay";

interface SalonsDetailServicesProps {
  salonId: string;
  branches?: ISalonBranch[] | null;
  /** Names only — shown while/if the priced list can't load. */
  services?: ISalonServiceSummary[] | null;
}

/**
 * «خدمات» with price and duration (the first active branch's priced list — every salon has one,
 * most have only one). A row starts booking with that service already picked.
 */
export default function SalonsDetailServices({ salonId, branches, services }: SalonsDetailServicesProps) {
  const active = (branches ?? []).filter((b) => b.publicId && b.isActive !== false);
  const branch = active[0] ?? (branches ?? []).find((b) => b.publicId) ?? null;
  const priced = useQueryBranchServices(branch?.publicId ?? null).data?.data ?? [];
  const items = priced.filter((s) => s.offeringPublicId);

  if (!items.length && !services?.length) return null;

  const bookHref = (offeringPublicId?: string | null) => {
    const q = new URLSearchParams();
    if (offeringPublicId) q.set("service", offeringPublicId);
    if (branch?.publicId) q.set("branch", branch.publicId);
    const qs = q.toString();
    return `${RouteAddress.SALONS.BOOK(salonId)}${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="mt-6 px-safe-area">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-base font-bold text-foreground">خدمات</h2>
        {active.length > 1 && branch ? (
          <span className="text-[11px] text-foreground-muted">قیمت‌ها در شعبه‌ی {branch.name}</span>
        ) : null}
      </div>

      {items.length ? (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-surface">
          {items.map((svc) => {
            const Icon = getServiceTypeIcon(svc.name);
            return (
              <Link
                key={svc.offeringPublicId}
                href={bookHref(svc.offeringPublicId)}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-hover active:bg-surface-hover"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-brand text-content-brand">
                  <Icon size={18} weight="duotone" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-foreground">{svc.name}</span>
                  <span className="block text-xs text-foreground-muted">
                    {svc.durationMinutes.toLocaleString(APP_LOCALE)} دقیقه
                  </span>
                </span>
                <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">
                  {formatToman(svc.price)} <span className="text-xs font-medium text-foreground-muted">تومان</span>
                </span>
                <CaretLeftIcon size={16} className="shrink-0 text-foreground-muted" />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="no-scrollbar -mx-safe-area flex gap-2 overflow-x-auto px-safe-area">
          {(services ?? []).map((service, index) => (
            <Link
              key={service.offeringPublicId || service.id || `${service.name}-${index}`}
              href={bookHref(service.offeringPublicId)}
              className="shrink-0 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-foreground"
            >
              {service.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
