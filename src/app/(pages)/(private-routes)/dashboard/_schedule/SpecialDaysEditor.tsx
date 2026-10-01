"use client";

import { useState } from "react";
import { CaretLeftIcon, PlusIcon } from "@phosphor-icons/react";
import BottomSheet from "@/shared/components/composites/bottom-sheet/BottomSheet";
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
import {
  useMutateSpecialSchedules,
  useQuerySpecialSchedules,
} from "@/services/domains/special-schedules/hooks";
import type { ISpecialSchedule } from "@/services/domains/special-schedules/types/special-schedules.type";
import { addDaysYmd, formatSalonDate, salonTodayYmd, ymdToDate } from "@/shared/utils/salonTime";
import { cn } from "@/shared/utils/className";
import { DashboardDateField } from "../_components/DashboardDateField";
import { DashboardSelect } from "../_components/DashboardSelect";
import type { DashboardToastState } from "../_components/DashboardToast";
import { dashboardQuietButtonClass } from "../_components/buttonClasses";
import { TIME_OPTIONS, hhmm, scheduleErrorMessage, toApiTime } from "./scheduleUtils";

/** Longest leave created in one go (one row per day). */
const MAX_RANGE_DAYS = 31;

const chip = (active: boolean) =>
  cn(
    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
    active ? "bg-primary text-primary-foreground" : "bg-surface-hover text-foreground-muted"
  );

function dateLabel(ymd: string): string {
  try {
    return formatSalonDate(ymdToDate(ymd), { weekday: "long", day: "numeric", month: "long" });
  } catch {
    return ymd;
  }
}

type Draft = {
  id: number | null;
  from: string;
  to: string;
  isOffDay: boolean;
  start: string;
  end: string;
  note: string;
};

const emptyDraft = (): Draft => ({
  id: null,
  from: salonTodayYmd(),
  to: "",
  isOffDay: true,
  start: "10:00",
  end: "14:00",
  note: "",
});

/** Upcoming exceptions to the weekly schedule: leave (one day or a range) or different hours. */
export function SpecialDaysEditor({
  staffMemberId,
  onToast,
}: {
  staffMemberId: number;
  onToast: (t: DashboardToastState) => void;
}) {
  const today = salonTodayYmd();
  const query = useQuerySpecialSchedules(staffMemberId, { from: today });
  const mutations = useMutateSpecialSchedules();
  const items = [...(query.data?.data ?? [])]
    .filter((x) => x.date.slice(0, 10) >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  const [draft, setDraft] = useState<Draft | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const draftError =
    draft && !draft.isOffDay && draft.start >= draft.end
      ? "ساعت پایان باید بعد از شروع باشد."
      : draft && draft.to && draft.to < draft.from
        ? "تاریخ پایان باید بعد از شروع باشد."
        : null;

  const openItem = (item: ISpecialSchedule) =>
    setDraft({
      id: item.id,
      from: item.date.slice(0, 10),
      to: "",
      isOffDay: item.isOffDay,
      start: hhmm(item.startTime) || "10:00",
      end: hhmm(item.endTime) || "14:00",
      note: item.note ?? "",
    });

  const save = async () => {
    if (!draft || draftError) return;
    setSaving(true);
    const body = (date: string) => ({
      staffMemberId,
      date,
      isOffDay: draft.isOffDay,
      startTime: draft.isOffDay ? null : toApiTime(draft.start),
      endTime: draft.isOffDay ? null : toApiTime(draft.end),
      note: draft.note.trim() || null,
    });
    try {
      if (draft.id != null) {
        await mutations.update.mutateAsync({ id: draft.id, body: body(draft.from) });
      } else {
        const last = draft.to || draft.from;
        for (let d = draft.from, n = 0; d <= last && n < MAX_RANGE_DAYS; d = addDaysYmd(d, 1), n++) {
          await mutations.create.mutateAsync(body(d));
        }
      }
      onToast({ type: "success", message: "روز خاص ذخیره شد." });
      setDraft(null);
    } catch (err) {
      onToast({ type: "error", message: scheduleErrorMessage(err, "ذخیره‌ی روز خاص ناموفق بود.") });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteId == null) return;
    try {
      await mutations.remove.mutateAsync(deleteId);
      onToast({ type: "success", message: "روز خاص حذف شد." });
      setDraft(null);
    } catch (err) {
      onToast({ type: "error", message: scheduleErrorMessage(err, "حذف ناموفق بود.") });
    }
    setDeleteId(null);
  };

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-semibold text-foreground-muted">روزهای خاص و مرخصی</h2>
        <button
          type="button"
          onClick={() => setDraft(emptyDraft())}
          className="flex items-center gap-1 text-xs font-semibold text-primary"
        >
          <PlusIcon size={14} weight="bold" />
          افزودن
        </button>
      </div>
      {items.length === 0 ? (
        <p className="rounded-[16px] bg-background-secondary px-4 py-4 text-xs text-foreground-muted">
          روز خاصی در پیش نیست. مرخصی یا ساعت متفاوت یک روز را از «افزودن» ثبت کنید.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openItem(item)}
              className="flex items-center gap-3 px-4 py-3 text-right hover:bg-surface-hover"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">
                  {dateLabel(item.date.slice(0, 10))}
                </span>
                <span className="block truncate text-xs text-foreground-muted">
                  {item.isOffDay
                    ? "تعطیل"
                    : `${hhmm(item.startTime)} تا ${hhmm(item.endTime)}`}
                  {item.note ? ` · ${item.note}` : ""}
                </span>
              </span>
              <CaretLeftIcon size={16} className="shrink-0 text-foreground-muted" />
            </button>
          ))}
        </div>
      )}

      <BottomSheet open={!!draft} onClose={() => setDraft(null)}>
        {draft ? (
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-foreground">
              {draft.id != null ? "ویرایش روز خاص" : "روز خاص"}
            </h3>
            <div className="flex gap-2">
              <button type="button" className={chip(draft.isOffDay)} onClick={() => setDraft({ ...draft, isOffDay: true })}>
                تعطیل / مرخصی
              </button>
              <button type="button" className={chip(!draft.isOffDay)} onClick={() => setDraft({ ...draft, isOffDay: false })}>
                ساعت متفاوت
              </button>
            </div>
            <DashboardDateField
              name="special-from"
              label={draft.id == null ? "از تاریخ" : "تاریخ"}
              value={draft.from}
              onChange={(from) => from && setDraft({ ...draft, from })}
            />
            {draft.id == null && draft.isOffDay ? (
              <DashboardDateField
                name="special-to"
                label="تا تاریخ (برای مرخصی چندروزه)"
                value={draft.to}
                onChange={(to) => setDraft({ ...draft, to })}
              />
            ) : null}
            {!draft.isOffDay ? (
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1 text-xs text-foreground-muted">
                  شروع
                  <DashboardSelect value={draft.start} onChange={(e) => setDraft({ ...draft, start: e.target.value })}>
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </DashboardSelect>
                </label>
                <label className="flex flex-col gap-1 text-xs text-foreground-muted">
                  پایان
                  <DashboardSelect value={draft.end} onChange={(e) => setDraft({ ...draft, end: e.target.value })}>
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </DashboardSelect>
                </label>
              </div>
            ) : null}
            <Input
              value={draft.note}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              placeholder="یادداشت (اختیاری)"
              className="rounded-[12px]"
            />
            {draftError ? <p className="text-xs text-error">{draftError}</p> : null}
            <Button
              type="button"
              className="w-full rounded-[12px]"
              disabled={!!draftError}
              isLoading={saving}
              onClick={() => void save()}
            >
              ذخیره
            </Button>
            {draft.id != null ? (
              <button
                type="button"
                onClick={() => setDeleteId(draft.id)}
                className="text-sm font-semibold text-error"
              >
                حذف این روز خاص
              </button>
            ) : null}
          </div>
        ) : null}
      </BottomSheet>

      <Dialog open={deleteId != null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف روز خاص؟</DialogTitle>
            <DialogDescription>برنامه‌ی این روز به برنامه‌ی هفتگی برمی‌گردد.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" className={dashboardQuietButtonClass} onClick={() => setDeleteId(null)}>
              انصراف
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-error hover:bg-error-background"
              isLoading={mutations.remove.isPending}
              onClick={() => void confirmDelete()}
            >
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
