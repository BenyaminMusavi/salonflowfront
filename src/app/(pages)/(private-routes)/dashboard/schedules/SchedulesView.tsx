"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/shared/components/primitives/button/Button";
import { Input } from "@/shared/components/primitives/input/Input";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useQueryCatalogOfferings } from "@/services/domains/catalog/hooks";
import { useQueryStaffForOfferings } from "@/services/domains/staff-profile/hooks";
import {
  useMutateWorkingSchedules,
  useQueryWorkingSchedules,
} from "@/services/domains/working-schedules/hooks";
import {
  useMutateSpecialSchedules,
  useQuerySpecialSchedules,
} from "@/services/domains/special-schedules/hooks";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";

const DAYS = [
  { value: 0, label: "یکشنبه" },
  { value: 1, label: "دوشنبه" },
  { value: 2, label: "سه‌شنبه" },
  { value: 3, label: "چهارشنبه" },
  { value: 4, label: "پنجشنبه" },
  { value: 5, label: "جمعه" },
  { value: 6, label: "شنبه" },
];

export default function SchedulesView() {
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const offeringsQuery = useQueryCatalogOfferings(true);
  const offeringIds = (offeringsQuery.data?.data ?? []).map((x) => x.id);
  const staffQuery = useQueryStaffForOfferings(
    salonPublicId || undefined,
    offeringIds,
    { enabled: offeringIds.length > 0 }
  );
  const staff = staffQuery.data?.data ?? [];
  const [staffMemberId, setStaffMemberId] = useState<number | "">("");
  const selectedStaffId = Number(staffMemberId || 0) || undefined;

  const workingQuery = useQueryWorkingSchedules(selectedStaffId);
  const specialQuery = useQuerySpecialSchedules(selectedStaffId);
  const workingMutations = useMutateWorkingSchedules();
  const specialMutations = useMutateSpecialSchedules();

  const [workingForm, setWorkingForm] = useState({
    dayOfWeek: 6,
    startTime: "09:00:00",
    endTime: "18:00:00",
    isOffDay: false,
  });
  const [specialForm, setSpecialForm] = useState({
    date: "",
    isOffDay: true,
    startTime: "",
    endTime: "",
    note: "",
  });

  const onCreateWorking = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) return;
    setError("");
    setSuccess("");
    try {
      await workingMutations.create.mutateAsync({
        staffMemberId: selectedStaffId,
        dayOfWeek: Number(workingForm.dayOfWeek),
        startTime: workingForm.isOffDay ? null : workingForm.startTime,
        endTime: workingForm.isOffDay ? null : workingForm.endTime,
        isOffDay: workingForm.isOffDay,
        isManagedBySalon: true,
      });
      setSuccess("برنامه هفتگی ذخیره شد.");
    } catch (err) {
      setError(getApiErrorMessage(err, "ثبت برنامه هفتگی ناموفق بود."));
    }
  };

  const onCreateSpecial = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) return;
    setError("");
    setSuccess("");
    try {
      await specialMutations.create.mutateAsync({
        staffMemberId: selectedStaffId,
        date: specialForm.date,
        isOffDay: specialForm.isOffDay,
        startTime: specialForm.isOffDay ? null : specialForm.startTime || null,
        endTime: specialForm.isOffDay ? null : specialForm.endTime || null,
        note: specialForm.note || null,
      });
      setSuccess("برنامه خاص ثبت شد.");
      setSpecialForm({ date: "", isOffDay: true, startTime: "", endTime: "", note: "" });
    } catch (err) {
      setError(getApiErrorMessage(err, "ثبت برنامه خاص ناموفق بود."));
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-col gap-4 px-safe-area pb-8">
      <div className="rounded-lg bg-surface-secondary p-3">
        <h1 className="mb-2 text-base font-bold text-foreground">برنامه کاری پرسنل</h1>
        <p className="text-xs text-foreground-muted">
          مدیریت برنامه هفتگی (`working-schedules`) و روزهای خاص (`special-schedules`).
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
        <h2 className="mb-2 text-sm font-bold text-foreground">افزودن برنامه هفتگی</h2>
        <form className="grid grid-cols-1 gap-2" onSubmit={onCreateWorking}>
          <select
            className="h-12 rounded-[2px] bg-foreground/5 px-3 text-sm text-foreground"
            value={workingForm.dayOfWeek}
            onChange={(e) =>
              setWorkingForm((prev) => ({ ...prev, dayOfWeek: Number(e.target.value) }))
            }
          >
            {DAYS.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
          <label className="text-xs text-foreground-muted">
            <input
              type="checkbox"
              className="me-2"
              checked={workingForm.isOffDay}
              onChange={(e) =>
                setWorkingForm((prev) => ({ ...prev, isOffDay: e.target.checked }))
              }
            />
            روز تعطیل
          </label>
          {!workingForm.isOffDay ? (
            <>
              <Input
                type="time"
                value={workingForm.startTime.slice(0, 5)}
                onChange={(e) =>
                  setWorkingForm((prev) => ({ ...prev, startTime: `${e.target.value}:00` }))
                }
              />
              <Input
                type="time"
                value={workingForm.endTime.slice(0, 5)}
                onChange={(e) =>
                  setWorkingForm((prev) => ({ ...prev, endTime: `${e.target.value}:00` }))
                }
              />
            </>
          ) : null}
          <Button type="submit" isLoading={workingMutations.create.isPending}>
            ثبت برنامه هفتگی
          </Button>
        </form>

        <div className="mt-3 space-y-2">
          {(workingQuery.data?.data ?? []).map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-md border border-border p-2 text-xs">
              <span className="text-foreground-muted">
                {DAYS.find((d) => d.value === item.dayOfWeek)?.label} |{" "}
                {item.isOffDay ? "تعطیل" : `${item.startTime} - ${item.endTime}`}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => workingMutations.remove.mutate(item.id)}
              >
                حذف
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-surface-secondary p-3">
        <h2 className="mb-2 text-sm font-bold text-foreground">روز خاص / مرخصی</h2>
        <form className="grid grid-cols-1 gap-2" onSubmit={onCreateSpecial}>
          <Input
            type="date"
            value={specialForm.date}
            onChange={(e) => setSpecialForm((prev) => ({ ...prev, date: e.target.value }))}
          />
          <label className="text-xs text-foreground-muted">
            <input
              type="checkbox"
              className="me-2"
              checked={specialForm.isOffDay}
              onChange={(e) =>
                setSpecialForm((prev) => ({ ...prev, isOffDay: e.target.checked }))
              }
            />
            مرخصی کامل
          </label>
          {!specialForm.isOffDay ? (
            <>
              <Input
                type="time"
                value={specialForm.startTime}
                onChange={(e) =>
                  setSpecialForm((prev) => ({ ...prev, startTime: e.target.value }))
                }
              />
              <Input
                type="time"
                value={specialForm.endTime}
                onChange={(e) => setSpecialForm((prev) => ({ ...prev, endTime: e.target.value }))}
              />
            </>
          ) : null}
          <Input
            placeholder="یادداشت"
            value={specialForm.note}
            onChange={(e) => setSpecialForm((prev) => ({ ...prev, note: e.target.value }))}
          />
          <Button type="submit" isLoading={specialMutations.create.isPending}>
            ثبت برنامه خاص
          </Button>
        </form>

        <div className="mt-3 space-y-2">
          {(specialQuery.data?.data ?? []).map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-md border border-border p-2 text-xs">
              <span className="text-foreground-muted">
                {item.date} | {item.isOffDay ? "تعطیل" : `${item.startTime} - ${item.endTime}`}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => specialMutations.remove.mutate(item.id)}
              >
                حذف
              </Button>
            </div>
          ))}
        </div>
      </div>

      {error ? <p className="text-sm text-error">{error}</p> : null}
      {success ? <p className="text-sm text-primary">{success}</p> : null}
    </div>
  );
}

