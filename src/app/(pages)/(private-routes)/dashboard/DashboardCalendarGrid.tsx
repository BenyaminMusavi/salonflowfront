"use client";

import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { CaretLeftIcon } from "@phosphor-icons/react";
import appointmentsService from "@/services/domains/appointments/appointments.service";
import { STAFF_DAY_BOARD_QUERY_KEY } from "@/services/domains/appointments/hooks/useQueryStaffDayBoard";
import { useMutateSalonLifecycle } from "@/services/domains/appointments/hooks";
import type { IStaffDayBoardItem } from "@/services/domains/appointments/types/appointments.type";
import type { IStaffProfile } from "@/services/domains/staff-profile/types/staff-profile.type";
import { AppointmentStatus } from "@/services/common/enums/domain-enums";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { Button } from "@/shared/components/primitives/button/Button";
import { Input } from "@/shared/components/primitives/input/Input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/primitives/dialog/Dialog";

// Fixed business-hours window rather than deriving from working-schedules — a
// reasonable default for a first version; can be made schedule-aware later.
const DAY_START_HOUR = 8;
const DAY_END_HOUR = 22;
const TOTAL_MINUTES = (DAY_END_HOUR - DAY_START_HOUR) * 60;
const HOUR_LABELS = Array.from(
  { length: DAY_END_HOUR - DAY_START_HOUR + 1 },
  (_, i) => DAY_START_HOUR + i
);
const COLUMN_HEIGHT_PX = 48 * (DAY_END_HOUR - DAY_START_HOUR);

function minutesSinceDayStart(iso: string): number {
  const d = new Date(iso);
  return (d.getHours() - DAY_START_HOUR) * 60 + d.getMinutes();
}

function formatClock(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function staffLabel(member: IStaffProfile): string {
  return (
    member.fullName ||
    [member.firstName, member.lastName].filter(Boolean).join(" ") ||
    "پرسنل"
  );
}

function statusBlockClass(status: number): string {
  switch (status) {
    case AppointmentStatus.CheckedIn:
      return "bg-primary/20 border-primary text-primary";
    case AppointmentStatus.Completed:
      return "bg-success-background border-success text-success";
    case AppointmentStatus.Cancelled:
      return "bg-foreground/10 border-border text-foreground-muted";
    case AppointmentStatus.NoShow:
      return "bg-error-background border-error text-error";
    default:
      return "bg-warning-background border-warning text-warning";
  }
}

interface DashboardCalendarGridProps {
  date: string;
  staff: IStaffProfile[];
  onToast: (toast: { type: "success" | "error"; message: string }) => void;
}

export default function DashboardCalendarGrid({
  date,
  staff,
  onToast,
}: DashboardCalendarGridProps) {
  const dayBoardQueries = useQueries({
    queries: staff.map((member) => ({
      queryKey: [STAFF_DAY_BOARD_QUERY_KEY, member.id, date],
      queryFn: () => appointmentsService.getStaffDayBoard(member.id!, date),
      enabled: member.id != null && !!date,
    })),
  });

  const lifecycle = useMutateSalonLifecycle();
  const [rescheduleTarget, setRescheduleTarget] = useState<IStaffDayBoardItem | null>(
    null
  );
  const [newTime, setNewTime] = useState("");

  const openReschedule = (item: IStaffDayBoardItem) => {
    setRescheduleTarget(item);
    const d = new Date(item.startTime);
    setNewTime(
      `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
    );
  };

  const confirmReschedule = async () => {
    if (!rescheduleTarget || !newTime) return;
    const base = new Date(rescheduleTarget.startTime);
    const [h, m] = newTime.split(":").map(Number);
    base.setHours(h, m, 0, 0);
    try {
      await lifecycle.reschedule.mutateAsync({
        id: rescheduleTarget.appointmentId,
        newStartTime: base.toISOString(),
      });
      onToast({ type: "success", message: "نوبت جابه‌جا شد." });
      setRescheduleTarget(null);
    } catch (err) {
      onToast({
        type: "error",
        message: getApiErrorMessage(err, "جابه‌جایی نوبت ناموفق بود."),
      });
    }
  };

  const isLoading = dayBoardQueries.some((q) => q.isLoading);

  return (
    <div className="overflow-x-auto rounded-[16px] border border-border bg-surface">
      <div className="flex">
        {/* Time axis */}
        <div className="sticky right-0 z-10 w-12 shrink-0 border-l border-border bg-surface">
          <div className="h-10 border-b border-border" />
          <div className="relative" style={{ height: COLUMN_HEIGHT_PX }}>
            {HOUR_LABELS.map((hour, i) => (
              <div
                key={hour}
                className="absolute inset-x-0 text-center text-[10px] text-foreground-muted"
                style={{ top: i === 0 ? 0 : `${(i / (HOUR_LABELS.length - 1)) * 100}%` }}
              >
                {String(hour).padStart(2, "0")}
              </div>
            ))}
          </div>
        </div>

        {staff.length === 0 ? (
          <div className="flex h-40 flex-1 items-center justify-center text-xs text-foreground-muted">
            پرسنلی برای نمایش نیست.
          </div>
        ) : (
          staff.map((member, index) => {
            const items = dayBoardQueries[index]?.data?.data ?? [];
            return (
              <div key={member.id ?? index} className="w-[140px] shrink-0 border-l border-border">
                <div className="flex h-10 items-center justify-center border-b border-border px-2">
                  <p className="truncate text-xs font-bold text-foreground">
                    {staffLabel(member)}
                  </p>
                </div>
                <div className="relative" style={{ height: COLUMN_HEIGHT_PX }}>
                  {HOUR_LABELS.slice(1, -1).map((hour, i) => (
                    <div
                      key={hour}
                      className="absolute inset-x-0 border-t border-border/60"
                      style={{ top: `${((i + 1) / (HOUR_LABELS.length - 1)) * 100}%` }}
                    />
                  ))}
                  {items.map((item) => {
                    const startMin = Math.max(0, minutesSinceDayStart(item.startTime));
                    const endMin = Math.min(
                      TOTAL_MINUTES,
                      minutesSinceDayStart(item.endTime)
                    );
                    if (endMin <= 0 || startMin >= TOTAL_MINUTES) return null;
                    const top = (startMin / TOTAL_MINUTES) * 100;
                    const height = Math.max(
                      2,
                      ((endMin - startMin) / TOTAL_MINUTES) * 100
                    );
                    return (
                      <button
                        key={item.appointmentId}
                        type="button"
                        onClick={() => openReschedule(item)}
                        className={`absolute inset-x-0.5 overflow-hidden rounded-[6px] border px-1.5 py-1 text-start text-[10px] leading-tight ${statusBlockClass(
                          Number(item.status)
                        )}`}
                        style={{ top: `${top}%`, height: `${height}%` }}
                      >
                        <p className="truncate font-bold">{formatClock(item.startTime)}</p>
                        <p className="truncate">{item.customerName}</p>
                        <p className="truncate opacity-80">{item.serviceName}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {isLoading && staff.length > 0 && (
        <p className="p-3 text-center text-xs text-foreground-muted">در حال بارگذاری…</p>
      )}

      <Dialog
        open={!!rescheduleTarget}
        onOpenChange={(open) => {
          if (!open) setRescheduleTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>جابه‌جایی نوبت</DialogTitle>
            <DialogDescription>
              {rescheduleTarget?.customerName} · {rescheduleTarget?.serviceName}
            </DialogDescription>
          </DialogHeader>
          <Input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
          />
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRescheduleTarget(null)}
            >
              انصراف
            </Button>
            <Button
              type="button"
              onClick={() => void confirmReschedule()}
              isLoading={lifecycle.reschedule.isPending}
              disabled={!newTime}
            >
              <span>ثبت زمان جدید</span>
              <CaretLeftIcon size={16} weight="bold" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
