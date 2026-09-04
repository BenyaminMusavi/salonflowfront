"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/shared/components/primitives/button/Button";
import { Input } from "@/shared/components/primitives/input/Input";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/primitives/drawer/Drawer";
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
import {
  DashboardCard,
  DashboardDateField,
  DashboardEmptyState,
  DashboardPage,
  DashboardPageHeader,
  DashboardSelect,
  DashboardToast,
  type DashboardToastState,
} from "../_components";
import { dashboardQuietButtonClass } from "../_components/buttonClasses";

const DAYS = [
  { value: 6, label: "شنبه" },
  { value: 0, label: "یکشنبه" },
  { value: 1, label: "دوشنبه" },
  { value: 2, label: "سه‌شنبه" },
  { value: 3, label: "چهارشنبه" },
  { value: 4, label: "پنجشنبه" },
  { value: 5, label: "جمعه" },
];

function staffLabel(member: { firstName?: string | null }) {
  return member.firstName || "پرسنل";
}

function formatShift(start?: string | null, end?: string | null) {
  const s = start?.slice(0, 5) ?? "";
  const e = end?.slice(0, 5) ?? "";
  if (!s && !e) return "تعطیل";
  return `${s} تا ${e}`;
}

export default function SchedulesView() {
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const [toast, setToast] = useState<DashboardToastState>(null);
  const [workingOpen, setWorkingOpen] = useState(false);
  const [specialOpen, setSpecialOpen] = useState(false);

  const offeringsQuery = useQueryCatalogOfferings(true);
  const offeringIds = (offeringsQuery.data?.data ?? []).map((x) => x.publicId);
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
  const workingItems = workingQuery.data?.data ?? [];

  const weekMap = useMemo(() => {
    const map = new Map<number, typeof workingItems>();
    for (const item of workingItems) {
      const list = map.get(item.dayOfWeek) ?? [];
      list.push(item);
      map.set(item.dayOfWeek, list);
    }
    return map;
  }, [workingItems]);

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
    try {
      await workingMutations.create.mutateAsync({
        staffMemberId: selectedStaffId,
        dayOfWeek: Number(workingForm.dayOfWeek),
        startTime: workingForm.isOffDay ? null : workingForm.startTime,
        endTime: workingForm.isOffDay ? null : workingForm.endTime,
        isOffDay: workingForm.isOffDay,
        isManagedBySalon: true,
      });
      setToast({ type: "success", message: "برنامه هفتگی ذخیره شد." });
      setWorkingOpen(false);
    } catch (err) {
      setToast({
        type: "error",
        message: getApiErrorMessage(err, "ثبت برنامه هفتگی ناموفق بود."),
      });
    }
  };

  const onCreateSpecial = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) return;
    try {
      await specialMutations.create.mutateAsync({
        staffMemberId: selectedStaffId,
        date: specialForm.date,
        isOffDay: specialForm.isOffDay,
        startTime: specialForm.isOffDay ? null : specialForm.startTime || null,
        endTime: specialForm.isOffDay ? null : specialForm.endTime || null,
        note: specialForm.note || null,
      });
      setToast({ type: "success", message: "برنامه خاص ثبت شد." });
      setSpecialForm({ date: "", isOffDay: true, startTime: "", endTime: "", note: "" });
      setSpecialOpen(false);
    } catch (err) {
      setToast({
        type: "error",
        message: getApiErrorMessage(err, "ثبت برنامه خاص ناموفق بود."),
      });
    }
  };

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="برنامه پرسنل"
        description="شیفت هفتگی و روزهای خاص هر پرسنل."
      />

      <DashboardCard>
        <DashboardSelect
          value={staffMemberId}
          onChange={(e) => setStaffMemberId(Number(e.target.value))}
        >
          <option value="">انتخاب پرسنل</option>
          {staff.map((member) => (
            <option key={member.staffMemberId} value={member.staffMemberId}>
              {staffLabel(member)}
            </option>
          ))}
        </DashboardSelect>
      </DashboardCard>

      {!selectedStaffId ? (
        <DashboardEmptyState
          title="پرسنل را انتخاب کنید"
          description="برای دیدن هفته کاری، یک نفر از تیم را انتخاب کنید."
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">هفته کاری</h2>
            <Button size="sm" onClick={() => setWorkingOpen(true)}>
              افزودن شیفت
            </Button>
          </div>
          <div className="space-y-2">
            {DAYS.map((day) => {
              const shifts = weekMap.get(day.value) ?? [];
              return (
                <DashboardCard key={day.value} className="p-3">
                  <p className="text-sm font-bold text-foreground">{day.label}</p>
                  {shifts.length === 0 ? (
                    <p className="mt-1 text-xs text-foreground-muted">شیفتی ثبت نشده</p>
                  ) : (
                    <div className="mt-2 space-y-2">
                      {shifts.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-2"
                        >
                          <span className="text-xs text-foreground-muted">
                            {item.isOffDay
                              ? "تعطیل"
                              : formatShift(item.startTime, item.endTime)}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className={dashboardQuietButtonClass}
                            onClick={() => workingMutations.remove.mutate(item.id)}
                          >
                            حذف
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </DashboardCard>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">روز خاص / مرخصی</h2>
            <Button size="sm" onClick={() => setSpecialOpen(true)}>
              افزودن
            </Button>
          </div>
          {(specialQuery.data?.data ?? []).length === 0 ? (
            <DashboardEmptyState
              title="روز خاصی ثبت نشده"
              description="مرخصی یا ساعت متفاوت یک روز مشخص را اینجا اضافه کنید."
            />
          ) : (
            <div className="space-y-2">
              {(specialQuery.data?.data ?? []).map((item) => (
                <DashboardCard key={item.id} className="flex items-center justify-between p-3">
                  <span className="text-xs text-foreground-muted">
                    {item.date} ·{" "}
                    {item.isOffDay ? "تعطیل" : formatShift(item.startTime, item.endTime)}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className={dashboardQuietButtonClass}
                    onClick={() => specialMutations.remove.mutate(item.id)}
                  >
                    حذف
                  </Button>
                </DashboardCard>
              ))}
            </div>
          )}
        </>
      )}

      <Drawer open={workingOpen} onOpenChange={setWorkingOpen}>
        <DrawerContent className="border-border bg-background">
          <DrawerHeader className="text-right">
            <DrawerTitle>افزودن شیفت هفتگی</DrawerTitle>
          </DrawerHeader>
          <form className="grid grid-cols-1 gap-2 px-4 pb-6" onSubmit={onCreateWorking}>
            <DashboardSelect
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
            </DashboardSelect>
            <label className="text-xs text-foreground-muted">
              <input
                type="checkbox"
                className="me-2 accent-primary"
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
        </DrawerContent>
      </Drawer>

      <Drawer open={specialOpen} onOpenChange={setSpecialOpen}>
        <DrawerContent className="border-border bg-background">
          <DrawerHeader className="text-right">
            <DrawerTitle>روز خاص</DrawerTitle>
          </DrawerHeader>
          <form className="grid grid-cols-1 gap-2 px-4 pb-6" onSubmit={onCreateSpecial}>
            <DashboardDateField
              name="special-date"
              value={specialForm.date}
              onChange={(date) => setSpecialForm((prev) => ({ ...prev, date }))}
              label="تاریخ"
            />
            <label className="text-xs text-foreground-muted">
              <input
                type="checkbox"
                className="me-2 accent-primary"
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
                  onChange={(e) =>
                    setSpecialForm((prev) => ({ ...prev, endTime: e.target.value }))
                  }
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
        </DrawerContent>
      </Drawer>

      <DashboardToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardPage>
  );
}
