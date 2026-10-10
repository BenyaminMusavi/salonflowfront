"use client";

import { useState } from "react";
import BottomSheet from "@/shared/components/composites/bottom-sheet/BottomSheet";
import { Button } from "@/shared/components/primitives/button/Button";
import { Switch } from "@/shared/components/primitives/switch/Switch";
import type { IScheduleDay } from "@/services/domains/salons/types/onboarding.type";
import { cn } from "@/shared/utils/className";
import { DashboardSelect } from "../../dashboard/_components/DashboardSelect";
import {
  TIME_OPTIONS,
  WEEK_DAYS,
  formatDayHours,
  hhmm,
  toApiTime,
  validateDayHours,
  type IDayHours,
} from "../../dashboard/_schedule/scheduleUtils";

const toHours = (d: IScheduleDay | undefined): IDayHours =>
  !d || d.isOffDay
    ? { working: false, start: "10:00", end: "20:00", breakStart: "", breakEnd: "" }
    : {
        working: true,
        start: hhmm(d.startTime) || "10:00",
        end: hhmm(d.endTime) || "20:00",
        breakStart: hhmm(d.breakStart),
        breakEnd: hhmm(d.breakEnd),
      };

const toDay = (dayOfWeek: number, h: IDayHours): IScheduleDay =>
  h.working
    ? {
        dayOfWeek,
        isOffDay: false,
        startTime: toApiTime(h.start),
        endTime: toApiTime(h.end),
        breakStart: h.breakStart ? toApiTime(h.breakStart) : null,
        breakEnd: h.breakEnd ? toApiTime(h.breakEnd) : null,
      }
    : { dayOfWeek, isOffDay: true, startTime: null, endTime: null, breakStart: null, breakEnd: null };

function TimeSelect({ value, onChange, allowEmpty }: { value: string; onChange: (v: string) => void; allowEmpty?: boolean }) {
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

/**
 * The owner's week while registering: same look as the panel's weekly editor (a switch and the
 * hours per day, edited in a sheet, 24-hour 15-minute steps, an optional break), but it edits the
 * local draft — the wizard saves it with save-my-schedule.
 */
export function OnboardingWeekEditor({
  schedule,
  onChange,
}: {
  schedule: IScheduleDay[];
  onChange: (days: IScheduleDay[]) => void;
}) {
  const days = WEEK_DAYS.map((d) => toHours(schedule.find((x) => x.dayOfWeek === d.value)));
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<IDayHours>(days[0]);
  const draftError = validateDayHours(draft);

  const commit = (next: IDayHours[]) => onChange(WEEK_DAYS.map((d, i) => toDay(d.value, next[i])));

  const apply = (toAllWorking: boolean) => {
    if (editing == null || draftError) return;
    commit(days.map((d, i) => (i === editing || (toAllWorking && d.working) ? { ...draft, working: true } : d)));
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
        {WEEK_DAYS.map((d, i) => (
          <div key={d.value} className="flex items-center gap-3 px-4 py-2.5">
            <button
              type="button"
              onClick={() => {
                setDraft({ ...days[i], working: true });
                setEditing(i);
              }}
              className="flex min-w-0 flex-1 flex-col items-start text-right"
            >
              <span className="text-sm font-semibold text-foreground">{d.label}</span>
              <span className={cn("truncate text-xs tabular-nums", days[i].working ? "text-foreground" : "text-foreground-muted")}>
                {formatDayHours(days[i])}
              </span>
            </button>
            <Switch
              checked={days[i].working}
              onCheckedChange={(working) => commit(days.map((x, j) => (j === i ? { ...x, working } : x)))}
              aria-label={`${d.label} کار می‌کنم`}
            />
          </div>
        ))}
      </div>
      <p className="px-1 text-xs text-foreground-muted">روی هر روز بزنید تا ساعتش را عوض کنید.</p>

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
                <TimeSelect allowEmpty value={draft.breakStart} onChange={(breakStart) => setDraft({ ...draft, breakStart })} />
              </label>
              <label className="flex flex-col gap-1 text-xs text-foreground-muted">
                پایان استراحت
                <TimeSelect allowEmpty value={draft.breakEnd} onChange={(breakEnd) => setDraft({ ...draft, breakEnd })} />
              </label>
            </div>
            {draftError ? <p className="text-xs text-error">{draftError}</p> : null}
            <Button type="button" className="w-full rounded-[12px]" disabled={!!draftError} onClick={() => apply(false)}>
              تأیید
            </Button>
            <button
              type="button"
              disabled={!!draftError}
              onClick={() => apply(true)}
              className="text-sm font-semibold text-primary disabled:opacity-50"
            >
              همین ساعت برای همه‌ی روزهای کاری
            </button>
          </div>
        ) : null}
      </BottomSheet>
    </div>
  );
}

/** «شنبه تا پنجشنبه 10:00 تا 20:00» style one-liners for the summary. */
export function scheduleSummary(schedule: IScheduleDay[]): string[] {
  return WEEK_DAYS.map((d) => {
    const h = toHours(schedule.find((x) => x.dayOfWeek === d.value));
    return `${d.label}: ${formatDayHours(h)}`;
  });
}
