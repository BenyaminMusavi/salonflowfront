"use client";

import { useEffect, useMemo, useState } from "react";
import BottomSheet from "@/shared/components/composites/bottom-sheet/BottomSheet";
import { Button } from "@/shared/components/primitives/button/Button";
import { Switch } from "@/shared/components/primitives/switch/Switch";
import { useQueryWorkingSchedules } from "@/services/domains/working-schedules/hooks";
import type { IWorkingSchedule } from "@/services/domains/working-schedules/types/working-schedules.type";
import { useMutateStaff } from "@/services/domains/staff/hooks";
import type { IScheduleConflict } from "@/services/domains/staff/types/staff.type";
import { APP_LOCALE } from "@/shared/utils/locale";
import { formatSalonDateTime } from "@/shared/utils/salonTime";
import { cn } from "@/shared/utils/className";
import { DashboardSelect } from "../_components/DashboardSelect";
import type { DashboardToastState } from "../_components/DashboardToast";
import {
  TIME_OPTIONS,
  WEEK_DAYS,
  dayHoursToRanges,
  formatDayHours,
  hhmm,
  scheduleErrorMessage,
  validateDayHours,
  type IDayHours,
} from "./scheduleUtils";

const OFF: IDayHours = { working: false, start: "10:00", end: "18:00", breakStart: "", breakEnd: "" };

function fromServer(row: IWorkingSchedule | undefined): IDayHours {
  if (!row || row.isOffDay) return { ...OFF };
  return {
    working: true,
    start: hhmm(row.startTime) || OFF.start,
    end: hhmm(row.endTime) || OFF.end,
    breakStart: hhmm(row.breakStart),
    breakEnd: hhmm(row.breakEnd),
  };
}

const same = (a: IDayHours, b: IDayHours) =>
  a.working === b.working &&
  (!a.working ||
    (a.start === b.start && a.end === b.end && a.breakStart === b.breakStart && a.breakEnd === b.breakEnd));

function TimeSelect({
  value,
  onChange,
  allowEmpty,
}: {
  value: string;
  onChange: (v: string) => void;
  allowEmpty?: boolean;
}) {
  return (
    <DashboardSelect value={value} onChange={(e) => onChange(e.target.value)} className="rounded-[12px]">
      {allowEmpty ? <option value="">—</option> : null}
      {TIME_OPTIONS.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </DashboardSelect>
  );
}

/** Appointments the new hours leave outside the shift — reported, never cancelled. */
export function ScheduleConflicts({ conflicts, title }: { conflicts: IScheduleConflict[]; title: string }) {
  if (conflicts.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5 rounded-[16px] border border-warning/40 bg-background-secondary px-4 py-3">
      <p className="text-xs font-semibold text-warning">
        {conflicts.length.toLocaleString(APP_LOCALE)} {title}
      </p>
      <ul className="flex flex-col gap-1 text-xs text-foreground-muted">
        {conflicts.slice(0, 8).map((c) => (
          <li key={c.appointmentPublicId}>
            {c.customerName || "مشتری"} ·{" "}
            {formatSalonDateTime(c.startTime, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-foreground-muted">این نوبت‌ها لغو نشده‌اند؛ در صورت نیاز جابه‌جا یا لغوشان کنید.</p>
    </div>
  );
}

/**
 * One person's working week: a switch and hours per day, edited in a small sheet, saved
 * together in one `PUT /api/staff/{publicId}/schedule/weekly` (a break = a split shift).
 */
export function WeeklyScheduleEditor({
  staffMemberId,
  staffPublicId,
  onToast,
}: {
  staffMemberId: number;
  staffPublicId: string;
  onToast: (t: DashboardToastState) => void;
}) {
  const query = useQueryWorkingSchedules(staffMemberId);
  const staff = useMutateStaff();
  const [conflicts, setConflicts] = useState<IScheduleConflict[]>([]);
  const rows = query.data?.data;

  const serverDays = useMemo(() => {
    const byDay = new Map<number, IWorkingSchedule[]>();
    for (const row of rows ?? []) byDay.set(row.dayOfWeek, [...(byDay.get(row.dayOfWeek) ?? []), row]);
    return WEEK_DAYS.map((d) => ({ rows: byDay.get(d.value) ?? [], hours: fromServer(byDay.get(d.value)?.[0]) }));
  }, [rows]);

  const [days, setDays] = useState<IDayHours[]>(() => WEEK_DAYS.map(() => ({ ...OFF })));
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<IDayHours>(OFF);
  const [saving, setSaving] = useState(false);

  // Reload from the server whenever it changes (after a save, or for another person).
  useEffect(() => {
    setDays(serverDays.map((d) => d.hours));
  }, [serverDays]);

  const dirty = days.some((d, i) => !same(d, serverDays[i].hours));
  const draftError = validateDayHours(draft);

  const openDay = (i: number) => {
    setDraft({ ...days[i], working: true });
    setEditing(i);
  };

  const applyDraft = (toAllWorking: boolean) => {
    if (editing == null || draftError) return;
    setDays((prev) =>
      prev.map((d, i) => (i === editing || (toAllWorking && d.working) ? { ...draft, working: true } : d))
    );
    setEditing(null);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await staff.saveWeekly.mutateAsync({
        publicId: staffPublicId,
        days: WEEK_DAYS.map((d, i) => ({
          dayOfWeek: d.value,
          isOff: !days[i].working,
          ranges: dayHoursToRanges(days[i]),
        })),
      });
      const found = res.data?.conflicts ?? [];
      setConflicts(found);
      onToast({
        type: "success",
        message: found.length
          ? `برنامه ذخیره شد · ${found.length.toLocaleString(APP_LOCALE)} نوبت بیرون از ساعت جدید است.`
          : "برنامه‌ی هفتگی ذخیره شد.",
      });
    } catch (err) {
      onToast({ type: "error", message: scheduleErrorMessage(err, "ذخیره‌ی برنامه ناموفق بود.") });
    } finally {
      setSaving(false);
    }
  };

  if (query.isLoading) {
    return <div className="h-64 animate-pulse rounded-[16px] bg-background-secondary" />;
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="px-1 text-xs font-semibold text-foreground-muted">هفته‌ی کاری</h2>
      <ScheduleConflicts conflicts={conflicts} title="نوبت آینده بیرون از ساعت جدید افتاده:" />
      <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
        {WEEK_DAYS.map((d, i) => (
          <div key={d.value} className="flex items-center gap-3 px-4 py-2.5">
            <button
              type="button"
              onClick={() => openDay(i)}
              className="flex min-w-0 flex-1 flex-col items-start text-right"
            >
              <span className="text-sm font-semibold text-foreground">{d.label}</span>
              <span
                className={cn(
                  "truncate text-xs tabular-nums",
                  days[i].working ? "text-foreground" : "text-foreground-muted"
                )}
              >
                {formatDayHours(days[i])}
              </span>
            </button>
            <Switch
              checked={days[i].working}
              onCheckedChange={(working) =>
                setDays((prev) => prev.map((x, j) => (j === i ? { ...x, working } : x)))
              }
              aria-label={`${d.label} کار می‌کند`}
            />
          </div>
        ))}
      </div>

      {dirty ? (
        <div className="sticky bottom-24 z-20 flex items-center gap-2 rounded-[16px] bg-background-elevated p-3 shadow-lg lg:bottom-4">
          <p className="flex-1 text-xs text-foreground-muted">تغییرات ذخیره نشده</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDays(serverDays.map((x) => x.hours))}
          >
            لغو
          </Button>
          <Button type="button" size="sm" className="rounded-[12px]" isLoading={saving} onClick={() => void save()}>
            ذخیره‌ی برنامه
          </Button>
        </div>
      ) : null}

      <BottomSheet open={editing != null} onClose={() => setEditing(null)}>
        {editing != null ? (
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-foreground">{WEEK_DAYS[editing].label}</h3>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1 text-xs text-foreground-muted">
                شروع
                <TimeSelect value={draft.start} onChange={(start) => setDraft({ ...draft, start })} />
              </label>
              <label className="flex flex-col gap-1 text-xs text-foreground-muted">
                پایان
                <TimeSelect value={draft.end} onChange={(end) => setDraft({ ...draft, end })} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1 text-xs text-foreground-muted">
                شروع استراحت (اختیاری)
                <TimeSelect
                  allowEmpty
                  value={draft.breakStart}
                  onChange={(breakStart) => setDraft({ ...draft, breakStart })}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-foreground-muted">
                پایان استراحت
                <TimeSelect
                  allowEmpty
                  value={draft.breakEnd}
                  onChange={(breakEnd) => setDraft({ ...draft, breakEnd })}
                />
              </label>
            </div>
            {draftError ? <p className="text-xs text-error">{draftError}</p> : null}
            <Button type="button" className="w-full rounded-[12px]" disabled={!!draftError} onClick={() => applyDraft(false)}>
              تأیید
            </Button>
            <button
              type="button"
              disabled={!!draftError}
              onClick={() => applyDraft(true)}
              className="text-sm font-semibold text-primary disabled:opacity-50"
            >
              همین ساعت برای همه‌ی روزهای کاری
            </button>
          </div>
        ) : null}
      </BottomSheet>
    </section>
  );
}
