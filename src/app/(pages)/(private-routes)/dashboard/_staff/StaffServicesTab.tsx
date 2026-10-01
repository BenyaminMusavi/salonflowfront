"use client";

import { useEffect, useMemo, useState } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { Button } from "@/shared/components/primitives/button/Button";
import { Switch } from "@/shared/components/primitives/switch/Switch";
import { MoneyInput } from "@/shared/components/primitives/input/MoneyInput";
import { DurationPicker } from "@/shared/components/primitives/input/DurationPicker";
import {
  useMutateStaffServices,
  useQueryCatalogOfferings,
  useQueryStaffServices,
} from "@/services/domains/catalog/hooks";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { formatToman } from "@/shared/utils/salonDisplay";
import { isValidServiceDuration } from "@/shared/utils/serviceDuration";
import { cn } from "@/shared/utils/className";
import type { DashboardToastState } from "../_components/DashboardToast";
import type { ISalonStaffMember } from "./useSalonStaff";

type Row = {
  offeringId: number;
  offeringPublicId: string;
  name: string;
  basePrice: number;
  baseDuration: number;
  active: boolean;
  customPrice: number | null;
  customDuration: number | null;
};

const sameRow = (a: Row, b: Row) =>
  a.active === b.active && a.customPrice === b.customPrice && a.customDuration === b.customDuration;

/**
 * What this person does and at what price/duration. With a numeric staff id the per-person
 * price lives here (catalog staff-services); before that (pending invite), only the service
 * list can be changed, through the roster.
 */
export function StaffServicesTab({
  member,
  onRosterChange,
  isRosterSaving,
  onToast,
}: {
  member: ISalonStaffMember;
  onRosterChange: (offeringPublicIds: string[]) => Promise<void>;
  isRosterSaving: boolean;
  onToast: (t: DashboardToastState) => void;
}) {
  const offerings = useQueryCatalogOfferings(true).data?.data ?? [];
  const staffServices = useQueryStaffServices(member.staffMemberId ?? undefined).data?.data;
  const mutate = useMutateStaffServices();
  const [open, setOpen] = useState<number | null>(null);

  const serverRows = useMemo<Row[]>(() => {
    const byOffering = new Map((staffServices ?? []).map((s) => [s.serviceOfferingId, s]));
    return offerings.map((o) => {
      const current = byOffering.get(o.id);
      return {
        offeringId: o.id,
        offeringPublicId: o.publicId,
        name: o.serviceTypeName || "خدمت",
        basePrice: o.basePrice,
        baseDuration: o.durationMinutes,
        active: member.staffMemberId
          ? !!current?.isActive
          : member.offeringPublicIds.includes(o.publicId),
        customPrice: current?.customPrice ?? null,
        customDuration: current?.customDurationMinutes ?? null,
      };
    });
  }, [offerings, staffServices, member.staffMemberId, member.offeringPublicIds]);

  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => setRows(serverRows), [serverRows]);
  const dirty = rows.some((r, i) => serverRows[i] && !sameRow(r, serverRows[i]));
  const update = (i: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const save = async () => {
    if (!rows.some((r) => r.active)) {
      onToast({ type: "error", message: "حداقل یک خدمت باید روشن بماند." });
      return;
    }
    if (rows.some((r) => r.active && r.customDuration != null && !isValidServiceDuration(r.customDuration))) {
      onToast({ type: "error", message: "مدت اختصاصی باید مضرب 15 دقیقه باشد." });
      return;
    }
    try {
      if (member.staffMemberId) {
        await mutate.mutateAsync({
          staffMemberId: member.staffMemberId,
          body: {
            services: rows
              .filter((r) => r.active)
              .map((r) => ({
                serviceOfferingId: r.offeringId,
                customPrice: r.customPrice,
                customDurationMinutes: r.customDuration,
                isActive: true,
              })),
          },
        });
      } else {
        await onRosterChange(rows.filter((r) => r.active).map((r) => r.offeringPublicId));
      }
      onToast({ type: "success", message: "خدمات ذخیره شد." });
    } catch (err) {
      onToast({ type: "error", message: getApiErrorMessage(err, "ذخیره‌ی خدمات ناموفق بود.") });
    }
  };

  if (offerings.length === 0) {
    return (
      <p className="rounded-[16px] bg-background-secondary p-4 text-sm text-foreground-muted">
        هنوز خدمتی تعریف نشده. از «سالن ← خدمات» شروع کنید.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {!member.staffMemberId ? (
        <p className="rounded-[12px] bg-background-secondary px-3 py-2 text-xs leading-5 text-foreground-muted">
          قیمت و مدت جداگانه برای این نفر بعد از پذیرش دعوت قابل تنظیم است.
        </p>
      ) : null}
      <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
        {rows.map((r, i) => {
          const custom = r.customPrice != null || r.customDuration != null;
          const expanded = open === r.offeringId && r.active && !!member.staffMemberId;
          return (
            <div key={r.offeringId} className="flex flex-col">
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  disabled={!r.active || !member.staffMemberId}
                  onClick={() => setOpen(expanded ? null : r.offeringId)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-right"
                >
                  <span className="min-w-0 flex-1">
                    <span className={cn("block truncate text-sm font-semibold", r.active ? "text-foreground" : "text-foreground-muted")}>
                      {r.name}
                    </span>
                    <span className="block truncate text-xs tabular-nums text-foreground-muted">
                      {formatToman(r.customPrice ?? r.basePrice)} تومان · {r.customDuration ?? r.baseDuration} دقیقه
                      {r.active && custom ? " · مخصوص این نفر" : ""}
                    </span>
                  </span>
                  {r.active && member.staffMemberId ? (
                    <CaretDownIcon
                      size={14}
                      className={cn("shrink-0 text-foreground-muted transition-transform", expanded && "rotate-180")}
                    />
                  ) : null}
                </button>
                <Switch
                  checked={r.active}
                  onCheckedChange={(active) => update(i, { active })}
                  aria-label={`${r.name} را انجام می‌دهد`}
                />
              </div>
              {expanded ? (
                <div className="flex flex-col gap-3 px-4 pb-4">
                  <MoneyInput
                    placeholder={`قیمت این نفر (پیش‌فرض ${formatToman(r.basePrice)})`}
                    value={r.customPrice}
                    onValueChange={(customPrice) => update(i, { customPrice })}
                    className="rounded-[12px]"
                  />
                  <DurationPicker
                    label="مدت این نفر"
                    optional
                    value={r.customDuration}
                    onChange={(customDuration) => update(i, { customDuration })}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      {dirty ? (
        <div className="sticky bottom-24 z-20 flex items-center gap-2 rounded-[16px] bg-background-elevated p-3 shadow-lg lg:bottom-4">
          <p className="flex-1 text-xs text-foreground-muted">تغییرات ذخیره نشده</p>
          <Button type="button" variant="ghost" size="sm" onClick={() => setRows(serverRows)}>
            لغو
          </Button>
          <Button
            type="button"
            size="sm"
            className="rounded-[12px]"
            isLoading={mutate.isPending || isRosterSaving}
            onClick={() => void save()}
          >
            ذخیره‌ی خدمات
          </Button>
        </div>
      ) : null}
    </div>
  );
}
