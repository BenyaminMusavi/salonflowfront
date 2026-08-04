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

type TRow = {
  serviceOfferingId: number;
  isActive: boolean;
  customPrice?: number | null;
  customDurationMinutes?: number | null;
};

export default function StaffServicesView() {
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    setError("");
    setSuccess("");
    if (!selectedStaffId) {
      setError("ابتدا یک پرسنل انتخاب کنید.");
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
      setSuccess("تخصیص خدمات پرسنل با موفقیت ذخیره شد.");
    } catch (err) {
      setError(getApiErrorMessage(err, "ذخیره تخصیص خدمات ناموفق بود."));
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-col gap-4 px-safe-area pb-8">
      <div className="rounded-lg bg-surface-secondary p-3">
        <h1 className="mb-2 text-base font-bold text-foreground">تخصیص خدمات به پرسنل</h1>
        <p className="text-xs text-foreground-muted">
          {"Staff-centric assignment با مسیر PUT /api/catalog/staff/{id}/services."}
        </p>
      </div>

      <div className="rounded-lg bg-surface-secondary p-3">
        <select
          className="h-12 w-full rounded-[2px] bg-foreground/5 px-3 text-sm text-foreground"
          value={staffMemberId}
          onChange={(e) => setStaffMemberId(Number(e.target.value))}
        >
          <option value="">انتخاب پرسنل</option>
          {staff.map((member) => (
            <option key={member.id} value={member.id}>
              {member.fullName || [member.firstName, member.lastName].filter(Boolean).join(" ")}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg bg-surface-secondary p-3">
        <h2 className="mb-3 text-sm font-bold text-foreground">لیست خدمات</h2>
        <div className="space-y-2">
          {rows.map((row) => {
            const offering = offerings.find((x) => x.id === row.serviceOfferingId);
            return (
              <div key={row.serviceOfferingId} className="rounded-md border border-border p-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
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
                  <span className="text-sm text-foreground">
                    {offering?.serviceTypeName || `Service #${row.serviceOfferingId}`}
                  </span>
                </label>
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
                                customPrice: e.target.value ? Number(e.target.value) : null,
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
              </div>
            );
          })}
          {rows.length === 0 ? (
            <p className="text-xs text-foreground-muted">
              ابتدا خدمات کاتالوگ را ایجاد کنید؛ سپس پرسنل فعال را انتخاب نمایید.
            </p>
          ) : null}
        </div>
        <div className="mt-3">
          <Button onClick={onSave} isLoading={mutateStaffServices.isPending}>
            ذخیره تخصیص‌ها
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-error">{error}</p> : null}
      {success ? <p className="text-sm text-primary">{success}</p> : null}
    </div>
  );
}

