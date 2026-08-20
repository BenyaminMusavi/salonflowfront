"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/shared/components/primitives/button/Button";
import { Input } from "@/shared/components/primitives/input/Input";
import {
  useMutateStaffServices,
  useQueryCatalogOfferings,
  useQueryStaffServices,
} from "@/services/domains/catalog/hooks";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useQueryStaffForOfferings } from "@/services/domains/staff-profile/hooks";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import {
  DashboardCard,
  DashboardEmptyState,
  DashboardPage,
  DashboardPageHeader,
  DashboardSelect,
  DashboardToast,
  type DashboardToastState,
} from "../_components";

type TRow = {
  serviceOfferingId: number;
  isActive: boolean;
  customPrice?: number | null;
  customDurationMinutes?: number | null;
};

function staffLabel(member: {
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}) {
  return (
    member.fullName ||
    [member.firstName, member.lastName].filter(Boolean).join(" ") ||
    "پرسنل"
  );
}

export default function StaffServicesView() {
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const [toast, setToast] = useState<DashboardToastState>(null);

  const offeringsQuery = useQueryCatalogOfferings(true);
  const offerings = offeringsQuery.data?.data ?? [];
  const offeringIds = useMemo(() => offerings.map((x) => x.id), [offerings]);

  const staffQuery = useQueryStaffForOfferings(
    salonPublicId || undefined,
    offeringIds,
    { enabled: offeringIds.length > 0 }
  );
  const staff = staffQuery.data?.data ?? [];

  const [staffMemberId, setStaffMemberId] = useState<number | "">("");
  const selectedStaffId = Number(staffMemberId || 0) || undefined;
  const staffServicesQuery = useQueryStaffServices(selectedStaffId);
  const staffServices = staffServicesQuery.data?.data ?? [];
  const mutateStaffServices = useMutateStaffServices();

  const [rows, setRows] = useState<TRow[]>([]);

  useEffect(() => {
    if (!selectedStaffId) {
      setRows([]);
      return;
    }
    const byOffering = new Map(staffServices.map((x) => [x.serviceOfferingId, x]));
    setRows(
      offerings.map((offering) => {
        const current = byOffering.get(offering.id);
        return {
          serviceOfferingId: offering.id,
          isActive: !!current?.isActive,
          customPrice: current?.customPrice ?? null,
          customDurationMinutes: current?.customDurationMinutes ?? null,
        };
      })
    );
  }, [selectedStaffId, offerings, staffServices]);

  const onSave = async () => {
    if (!selectedStaffId) {
      setToast({ type: "error", message: "ابتدا یک پرسنل انتخاب کنید." });
      return;
    }
    try {
      await mutateStaffServices.mutateAsync({
        staffMemberId: selectedStaffId,
        body: {
          services: rows
            .filter((row) => row.isActive)
            .map((row) => ({
              serviceOfferingId: row.serviceOfferingId,
              customPrice:
                typeof row.customPrice === "number" && Number.isFinite(row.customPrice)
                  ? row.customPrice
                  : null,
              customDurationMinutes:
                typeof row.customDurationMinutes === "number" &&
                Number.isFinite(row.customDurationMinutes)
                  ? row.customDurationMinutes
                  : null,
              isActive: true,
            })),
        },
      });
      setToast({ type: "success", message: "تخصیص خدمات پرسنل ذخیره شد." });
    } catch (err) {
      setToast({
        type: "error",
        message: getApiErrorMessage(err, "ذخیره تخصیص خدمات ناموفق بود."),
      });
    }
  };

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="خدمات پرسنل"
        description="برای هر پرسنل مشخص کنید کدام سرویس‌ها را ارائه می‌دهد."
      />

      <DashboardCard>
        <DashboardSelect
          value={staffMemberId}
          onChange={(e) => setStaffMemberId(Number(e.target.value))}
        >
          <option value="">انتخاب پرسنل</option>
          {staff.map((member) => (
            <option key={member.id} value={member.id}>
              {staffLabel(member)}
            </option>
          ))}
        </DashboardSelect>
      </DashboardCard>

      {!selectedStaffId ? (
        <DashboardEmptyState
          title="پرسنل را انتخاب کنید"
          description="ابتدا خدمات کاتالوگ را بسازید، سپس پرسنل را انتخاب کنید."
        />
      ) : (
        <div className="space-y-2">
          {rows.map((row) => {
            const offering = offerings.find((x) => x.id === row.serviceOfferingId);
            return (
              <DashboardCard key={row.serviceOfferingId} className="p-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-primary"
                    checked={row.isActive}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((it) =>
                          it.serviceOfferingId === row.serviceOfferingId
                            ? { ...it, isActive: e.target.checked }
                            : it
                        )
                      )
                    }
                  />
                  <span className="text-sm font-semibold text-foreground">
                    {offering?.serviceTypeName || "سرویس"}
                  </span>
                </label>
                {row.isActive ? (
                  <div className="mt-2 grid grid-cols-1 gap-2">
                    <Input
                      type="number"
                      placeholder="قیمت اختصاصی (اختیاری)"
                      value={row.customPrice ?? ""}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((it) =>
                            it.serviceOfferingId === row.serviceOfferingId
                              ? {
                                  ...it,
                                  customPrice: e.target.value
                                    ? Number(e.target.value)
                                    : null,
                                }
                              : it
                          )
                        )
                      }
                    />
                    <Input
                      type="number"
                      placeholder="مدت اختصاصی (دقیقه)"
                      value={row.customDurationMinutes ?? ""}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((it) =>
                            it.serviceOfferingId === row.serviceOfferingId
                              ? {
                                  ...it,
                                  customDurationMinutes: e.target.value
                                    ? Number(e.target.value)
                                    : null,
                                }
                              : it
                          )
                        )
                      }
                    />
                  </div>
                ) : null}
              </DashboardCard>
            );
          })}
          <Button onClick={onSave} isLoading={mutateStaffServices.isPending}>
            ذخیره تخصیص‌ها
          </Button>
        </div>
      )}

      <DashboardToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardPage>
  );
}
