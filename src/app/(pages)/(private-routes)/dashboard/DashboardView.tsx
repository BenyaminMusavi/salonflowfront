"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  CalendarBlankIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CheckIcon,
  FunnelSimpleIcon,
  XIcon,
} from "@phosphor-icons/react";
import BottomSheet from "@/shared/components/composites/bottom-sheet/BottomSheet";
import { Switch } from "@/shared/components/primitives/switch/Switch";
import { AppointmentStatus } from "@/services/common/enums/domain-enums";
import {
  useMutateSalonLifecycle,
  useQueryAgenda,
} from "@/services/domains/appointments/hooks";
import { appointmentStatusLabel } from "@/services/domains/appointments/utils/appointment-display";
import type { IAgendaItem } from "@/services/domains/appointments/types/appointments.type";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { useQueryCatalogOfferings } from "@/services/domains/catalog/hooks";
import { useQueryStaffForOfferings } from "@/services/domains/staff-profile/hooks/useQueryStaffForOfferings";
import {
  formatSalonDate,
  salonTodayYmd,
  utcToSalonYmd,
  ymdToDate,
} from "@/shared/utils/salonTime";
import { APP_LOCALE } from "@/shared/utils/locale";
import { cn } from "@/shared/utils/className";
import DashboardCalendarGrid from "./DashboardCalendarGrid";
import NoShowDialog from "./NoShowDialog";
import {
  DashboardDateField,
  DashboardPage,
  DashboardSkeleton,
  DashboardToast,
  useIsSalonStaff,
  useQuickBookStore,
  type DashboardToastState,
} from "./_components";
import { AgendaRow, formatClock } from "./_agenda/AgendaRow";
import { NowStrip } from "./_agenda/NowStrip";
import { AppointmentDetailsSheet } from "./_agenda/AppointmentDetailsSheet";
import {
  DAY_PART_LABEL,
  agendaRange,
  dayPart,
  getNowState,
  isInactiveStatus,
  summarizeAgenda,
  type AgendaView,
  type DayPart,
} from "./_agenda/agendaUtils";

type Scope = "all" | "mine" | number;

const STATUS_OPTIONS = [
  AppointmentStatus.Scheduled,
  AppointmentStatus.CheckedIn,
  AppointmentStatus.Completed,
  AppointmentStatus.Cancelled,
  AppointmentStatus.NoShow,
];

const n = (value: number) => value.toLocaleString(APP_LOCALE);

function dayTitle(ymd: string): string {
  try {
    return formatSalonDate(ymdToDate(ymd), { weekday: "long", day: "numeric", month: "long" });
  } catch {
    return ymd;
  }
}

const segment = (active: boolean) =>
  cn(
    "flex h-9 min-w-0 flex-1 items-center justify-center gap-1 truncate rounded-full px-2 text-[13px] font-semibold transition-colors",
    active ? "bg-primary text-primary-foreground" : "text-foreground-muted"
  );

const chip = (active: boolean) =>
  cn(
    "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
    active ? "bg-primary text-primary-foreground" : "bg-surface-hover text-foreground-muted"
  );

const sheetRow =
  "flex min-h-12 w-full items-center justify-between gap-3 rounded-[12px] px-3 text-right text-sm font-semibold text-foreground hover:bg-surface-hover";

/** Rows of one list block (borderless group on one surface). */
function AgendaGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
      {children}
    </div>
  );
}

/** «نوبت‌ها» — the panel's home: today by default, scan-first list, details on tap. */
export default function DashboardView() {
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const salonId = useSalonContextStore((s) => s.salonId);
  const isStaff = useIsSalonStaff();
  const today = salonTodayYmd();

  const [view, setView] = useState<AgendaView>("today");
  const [pickedDay, setPickedDay] = useState(today);
  const [weekOffset, setWeekOffset] = useState(0);
  // Staff start on their own appointments; the owner sees the whole salon.
  const [scope, setScope] = useState<Scope>(isStaff ? "mine" : "all");
  const [branchId, setBranchId] = useState<number | undefined>();
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [mode, setMode] = useState<"list" | "staff">("list");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [noShowItem, setNoShowItem] = useState<IAgendaItem | null>(null);
  const [toast, setToast] = useState<DashboardToastState>(null);
  const [scopeOpen, setScopeOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [dayPickerOpen, setDayPickerOpen] = useState(false);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const range = agendaRange(view, today, pickedDay, weekOffset);
  const singleDay = range.from === range.to;
  const isToday = singleDay && range.from === today;

  // The nav «＋» books into the day on screen (today when a week is shown).
  const setBoardDate = useQuickBookStore((s) => s.setBoardDate);
  const openQuickBook = useQuickBookStore((s) => s.openQuickBook);
  useEffect(() => {
    setBoardDate(singleDay ? range.from : null);
  }, [singleDay, range.from, setBoardDate]);
  useEffect(() => () => setBoardDate(null), [setBoardDate]);

  const branches = useQuerySalonById(salonPublicId || undefined).data?.data?.branches ?? [];
  const multiBranch = branches.length > 1;

  // No "all staff of a salon" endpoint yet: the bookable staff of every active service.
  const offerings = useQueryCatalogOfferings(true).data?.data ?? [];
  const offeringIds = useMemo(
    () => offerings.map((o) => o.publicId).filter(Boolean),
    [offerings]
  );
  const staff =
    useQueryStaffForOfferings(salonPublicId || salonId || undefined, offeringIds, {
      enabled: offeringIds.length > 0,
    }).data?.data ?? [];

  const agenda = useQueryAgenda({
    from: range.from,
    to: range.to,
    mine: scope === "mine",
    staffMemberId: typeof scope === "number" ? scope : undefined,
    branchId,
  });

  const lifecycle = useMutateSalonLifecycle();
  const selected = agenda.items.find((x) => x.numericId === selectedId) ?? null;

  const filtered = useMemo(
    () =>
      statusFilter == null
        ? agenda.items
        : agenda.items.filter((x) => Number(x.status) === statusFilter),
    [agenda.items, statusFilter]
  );
  const active = filtered.filter((x) => !isInactiveStatus(Number(x.status)));
  const inactive = filtered.filter((x) => isInactiveStatus(Number(x.status)));
  const summary = summarizeAgenda(agenda.items);
  const nowState = isToday ? getNowState(agenda.items, now) : null;

  const scopeLabel =
    scope === "all"
      ? "همه پرسنل"
      : scope === "mine"
        ? "فقط من"
        : staff.find((s) => s.staffMemberId === scope)?.firstName || "پرسنل";
  const filtersActive =
    statusFilter != null || branchId != null || showInactive || mode === "staff";

  const checkIn = async (item: IAgendaItem) => {
    try {
      await lifecycle.checkIn.mutateAsync(item.numericId);
      setToast({ type: "success", message: `ورود ${item.customerName || "مشتری"} ثبت شد.` });
    } catch (err) {
      setToast({ type: "error", message: getApiErrorMessage(err, "ثبت ورود ناموفق بود.") });
    }
  };

  const confirmNoShow = async (notifyCustomer: boolean) => {
    if (!noShowItem) return;
    try {
      await lifecycle.noShow.mutateAsync({ id: noShowItem.numericId, notifyCustomer });
      setToast({ type: "success", message: "«مراجعه نکرد» ثبت شد." });
    } catch (err) {
      setToast({ type: "error", message: getApiErrorMessage(err, "ثبت ناموفق بود.") });
    }
    setNoShowItem(null);
  };

  const open = (item: IAgendaItem) => setSelectedId(item.numericId);
  const row = (item: IAgendaItem) => (
    <AgendaRow
      key={item.numericId}
      item={item}
      showBranch={multiBranch && branchId == null}
      namesLoading={agenda.namesLoading}
      onOpen={open}
    />
  );

  /** One day: «صبح / بعدازظهر / عصر» blocks, the «الان» line, cancelled rows folded. */
  const renderDay = (items: IAgendaItem[], folded: IAgendaItem[], withNowLine: boolean) => {
    const parts: { part: DayPart; items: IAgendaItem[] }[] = [];
    for (const item of items) {
      const part = dayPart(item.startTime);
      const last = parts[parts.length - 1];
      if (last?.part === part) last.items.push(item);
      else parts.push({ part, items: [item] });
    }
    const nowIndex = withNowLine
      ? items.findIndex((x) => new Date(x.startTime).getTime() >= now)
      : -1;
    const nowItem = nowIndex > 0 ? items[nowIndex] : null;

    return (
      <div className="flex flex-col gap-4">
        {parts.map(({ part, items: block }, i) => (
          <section key={`${part}-${i}`} className="flex flex-col gap-2">
            <h2 className="px-1 text-xs font-semibold text-foreground-muted">
              {DAY_PART_LABEL[part]}
            </h2>
            <AgendaGroup>
              {block.map((item) => (
                <Fragment key={item.numericId}>
                  {item === nowItem ? (
                    <div className="flex items-center gap-2 px-4 py-1" aria-label="الان">
                      <span className="text-[11px] font-bold tabular-nums text-primary">
                        الان {formatClock(new Date(now).toISOString())}
                      </span>
                      <span className="h-px flex-1 bg-primary" />
                    </div>
                  ) : null}
                  {row(item)}
                </Fragment>
              ))}
            </AgendaGroup>
          </section>
        ))}
        {folded.length > 0 ? (
          showInactive || statusFilter != null ? (
            <section className="flex flex-col gap-2">
              <h2 className="px-1 text-xs font-semibold text-foreground-muted">
                لغو شده و مراجعه‌نکرده
              </h2>
              <AgendaGroup>{folded.map(row)}</AgendaGroup>
            </section>
          ) : (
            <button
              type="button"
              onClick={() => setShowInactive(true)}
              className="flex items-center justify-between rounded-[16px] bg-background-secondary px-4 py-3 text-sm text-foreground-muted"
            >
              {n(folded.length)} نوبت لغو شد یا مشتری مراجعه نکرد
              <CaretLeftIcon size={16} />
            </button>
          )
        ) : null}
      </div>
    );
  };

  const renderWeek = () => {
    const byDay = new Map<string, IAgendaItem[]>();
    for (const item of filtered) {
      const d = utcToSalonYmd(item.startTime);
      byDay.set(d, [...(byDay.get(d) ?? []), item]);
    }
    return (
      <div className="flex flex-col gap-5">
        {agenda.days.map((d) => {
          const all = byDay.get(d) ?? [];
          const dayActive = all.filter((x) => !isInactiveStatus(Number(x.status)));
          const dayInactive = all.filter((x) => isInactiveStatus(Number(x.status)));
          const shown = showInactive || statusFilter != null ? all : dayActive;
          return (
            <section key={d} className="flex flex-col gap-2">
              <h2 className="sticky top-16 z-10 -mx-1 bg-background/95 px-2 py-1 text-sm font-bold text-foreground backdrop-blur">
                {dayTitle(d)}
                <span className="ms-2 text-xs font-normal text-foreground-muted">
                  {dayActive.length ? `${n(dayActive.length)} نوبت` : "بدون نوبت"}
                  {dayInactive.length && !showInactive ? ` · ${n(dayInactive.length)} لغو` : ""}
                </span>
              </h2>
              {shown.length ? <AgendaGroup>{shown.map(row)}</AgendaGroup> : null}
            </section>
          );
        })}
        <button
          type="button"
          onClick={() => setWeekOffset((w) => (w === 0 ? 1 : 0))}
          className="flex items-center justify-center gap-1 py-2 text-sm font-semibold text-primary"
        >
          {weekOffset === 0 ? "هفته‌ی بعد" : "برگشت به این هفته"}
          <CaretLeftIcon size={14} />
        </button>
      </div>
    );
  };

  const summaryParts: { label: string; status: number | null; count: number }[] = [
    { label: "نوبت", status: null, count: summary.total },
    { label: "مانده", status: AppointmentStatus.Scheduled, count: summary.remaining },
    { label: "در سالن", status: AppointmentStatus.CheckedIn, count: summary.inSalon },
    { label: "انجام شد", status: AppointmentStatus.Completed, count: summary.done },
  ];

  return (
    <DashboardPage className="gap-3">
      {nowState ? (
        <NowStrip
          state={nowState}
          busy={lifecycle.checkIn.isPending || lifecycle.noShow.isPending}
          onOpen={open}
          onCheckIn={(item) => void checkIn(item)}
          onNoShow={setNoShowItem}
        />
      ) : null}

      <div className="flex gap-1 rounded-full bg-background-secondary p-1">
        <button type="button" className={segment(view === "today")} onClick={() => setView("today")}>
          امروز
        </button>
        <button type="button" className={segment(view === "tomorrow")} onClick={() => setView("tomorrow")}>
          فردا
        </button>
        <button
          type="button"
          className={segment(view === "week")}
          onClick={() => {
            setView("week");
            setWeekOffset(0);
            setMode("list");
          }}
        >
          این هفته
        </button>
        <button
          type="button"
          className={segment(view === "day")}
          onClick={() => setDayPickerOpen(true)}
          aria-label="انتخاب تاریخ"
        >
          <CalendarBlankIcon size={16} className="shrink-0" />
          {view === "day" ? (
            <span className="truncate">
              {formatSalonDate(ymdToDate(pickedDay), { day: "numeric", month: "short" })}
            </span>
          ) : null}
        </button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setScopeOpen(true)}
          className="flex h-9 items-center gap-1 rounded-full bg-surface-hover px-3 text-xs font-semibold text-foreground"
        >
          {scopeLabel}
          <CaretDownIcon size={12} />
        </button>
        <p className="min-w-0 flex-1 truncate text-center text-xs text-foreground-muted">
          {view === "week" ? (
            `${n(summary.total)} نوبت در این بازه`
          ) : (
            summaryParts
              .filter((p) => p.status == null || p.count > 0)
              .map((p, i) => (
                <Fragment key={p.label}>
                  {i > 0 ? " · " : ""}
                  <button
                    type="button"
                    onClick={() => setStatusFilter(p.status === statusFilter ? null : p.status)}
                    className={cn(p.status != null && p.status === statusFilter && "font-bold text-primary")}
                  >
                    {n(p.count)} {p.label}
                  </button>
                </Fragment>
              ))
          )}
        </p>
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          aria-label="فیلتر"
          className="relative flex h-9 w-9 items-center justify-center rounded-full bg-surface-hover text-foreground"
        >
          <FunnelSimpleIcon size={16} />
          {filtersActive ? (
            <span className="absolute end-1 top-1 h-2 w-2 rounded-full bg-primary" />
          ) : null}
        </button>
      </div>

      {statusFilter != null ? (
        <button
          type="button"
          onClick={() => setStatusFilter(null)}
          className="flex items-center gap-1 self-start rounded-full bg-surface-brand px-3 py-1 text-xs font-semibold text-content-brand"
        >
          فقط «{appointmentStatusLabel(statusFilter)}»
          <XIcon size={12} />
        </button>
      ) : null}

      {view === "week" ? null : (
        <p className="px-1 text-sm font-bold text-foreground">{dayTitle(range.from)}</p>
      )}

      {mode === "staff" && singleDay ? (
        <DashboardCalendarGrid
          date={range.from}
          branchPublicId={
            branches.find((b) => b.branchId === branchId)?.publicId ?? branches[0]?.publicId
          }
          staff={staff}
          onSelect={setSelectedId}
        />
      ) : agenda.isLoading ? (
        <DashboardSkeleton cards={1} rows={5} />
      ) : agenda.isError ? (
        <div className="rounded-[16px] bg-background-secondary p-6 text-center text-sm text-foreground-muted">
          دریافت نوبت‌ها ناموفق بود. اتصال را بررسی کنید.
        </div>
      ) : agenda.items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[16px] bg-background-secondary p-8 text-center">
          <p className="text-sm font-bold text-foreground">
            {view === "week" ? "در این بازه نوبتی نیست" : "برای این روز نوبتی نیست"}
          </p>
          <button
            type="button"
            onClick={openQuickBook}
            className="h-10 rounded-[12px] bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            ＋ نوبت جدید
          </button>
        </div>
      ) : view === "week" ? (
        renderWeek()
      ) : (
        renderDay(
          statusFilter != null && isInactiveStatus(statusFilter) ? [] : active,
          inactive,
          isToday
        )
      )}

      <AppointmentDetailsSheet
        item={selected}
        isStaff={isStaff}
        showBranch={multiBranch}
        onClose={() => setSelectedId(null)}
        onToast={setToast}
      />

      <NoShowDialog
        appointmentId={noShowItem?.numericId ?? null}
        subject={noShowItem ? `${noShowItem.customerName || "مشتری"} · ${formatClock(noShowItem.startTime)}` : undefined}
        onClose={() => setNoShowItem(null)}
        onConfirm={confirmNoShow}
        isPending={lifecycle.noShow.isPending}
      />

      <BottomSheet open={scopeOpen} onClose={() => setScopeOpen(false)}>
        <h2 className="mb-3 text-base font-bold text-foreground">نوبت‌های چه کسی؟</h2>
        <div className="flex max-h-[60vh] flex-col gap-1 overflow-y-auto">
          {(
            [
              ["all", "همه پرسنل"],
              ["mine", "فقط من"],
              ...staff.map((s) => [s.staffMemberId, s.firstName || "پرسنل"] as const),
            ] as const
          ).map(([value, label]) => (
            <button
              key={String(value)}
              type="button"
              className={sheetRow}
              onClick={() => {
                setScope(value as Scope);
                setScopeOpen(false);
              }}
            >
              {label}
              {scope === value ? <CheckIcon size={18} className="text-primary" /> : null}
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet open={filterOpen} onClose={() => setFilterOpen(false)}>
        <div className="flex flex-col gap-5">
          <h2 className="text-base font-bold text-foreground">فیلتر</h2>
          <section className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-foreground-muted">وضعیت</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={chip(statusFilter == null)} onClick={() => setStatusFilter(null)}>
                همه
              </button>
              {STATUS_OPTIONS.map((s) => (
                <button key={s} type="button" className={chip(statusFilter === s)} onClick={() => setStatusFilter(s)}>
                  {appointmentStatusLabel(s)}
                </button>
              ))}
            </div>
          </section>
          {multiBranch ? (
            <section className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-foreground-muted">شعبه</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={chip(branchId == null)} onClick={() => setBranchId(undefined)}>
                  همه شعبه‌ها
                </button>
                {branches.map((b) => (
                  <button
                    key={b.publicId}
                    type="button"
                    className={chip(branchId === b.branchId)}
                    onClick={() => setBranchId(b.branchId)}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </section>
          ) : null}
          {singleDay ? (
            <section className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-foreground-muted">نمایش</p>
              <div className="flex gap-2">
                <button type="button" className={chip(mode === "list")} onClick={() => setMode("list")}>
                  فهرست
                </button>
                <button type="button" className={chip(mode === "staff")} onClick={() => setMode("staff")}>
                  ستون پرسنل
                </button>
              </div>
            </section>
          ) : null}
          <label className="flex items-center justify-between gap-3 text-sm font-semibold text-foreground">
            نمایش نوبت‌های لغوشده و مراجعه‌نکرده
            <Switch checked={showInactive} onCheckedChange={setShowInactive} />
          </label>
        </div>
      </BottomSheet>

      <BottomSheet open={dayPickerOpen} onClose={() => setDayPickerOpen(false)}>
        <h2 className="mb-3 text-base font-bold text-foreground">انتخاب روز</h2>
        <DashboardDateField
          name="agenda-day"
          value={view === "day" ? pickedDay : ""}
          onChange={(d) => {
            if (!d) return;
            setPickedDay(d);
            setView(d === today ? "today" : "day");
            setDayPickerOpen(false);
          }}
        />
      </BottomSheet>

      <DashboardToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardPage>
  );
}
