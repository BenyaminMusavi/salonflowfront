"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  CaretLeftIcon,
  CaretRightIcon,
  ListIcon,
  PlusIcon,
  SquaresFourIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import DashboardCalendarGrid from "./DashboardCalendarGrid";
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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/primitives/drawer/Drawer";
import { AppointmentStatus } from "@/services/common/enums/domain-enums";
import { formatAppointmentDateTime } from "@/services/domains/appointments/utils/appointment-display";
import { findConflictingAppointment } from "@/services/domains/appointments/utils/conflictCheck";
import {
  validateQuickBook,
  TQuickBookFieldErrors,
} from "@/services/domains/appointments/utils/quickBookValidation";
import {
  useMutateQuickBook,
  useMutateSalonLifecycle,
  useQuerySalonAppointments,
} from "@/services/domains/appointments/hooks";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { useQueryCatalogOfferings } from "@/services/domains/catalog/hooks";
import { useQueryStaffForOfferings } from "@/services/domains/staff-profile/hooks/useQueryStaffForOfferings";
import {
  getApiErrorMessage,
  SUBSCRIPTION_OWNER_LOCK_MESSAGE,
  toBookingStartTime,
} from "@/services/domains/booking/utils/booking-mappers";
import { useSubscriptionEntitlement } from "@/services/domains/subscriptions/hooks/useSubscriptionEntitlement";
import { useQueryDashboardSummary } from "@/services/domains/reports/hooks";
import {
  formatMoneyOrDash,
  formatRate,
} from "@/services/domains/reports/utils/report-display";
import { asNumber, metricFromUnknown } from "@/services/domains/reports/utils/report-mappers";
import Link from "next/link";
import { RouteAddress } from "@/shared/data/routeAddress";
import {
  AppointmentStatusChip,
  DashboardCard,
  DashboardDateField,
  DashboardEmptyState,
  DashboardKpi,
  DashboardPage,
  DashboardSelect,
  DashboardSkeleton,
  DashboardToast,
  formatJalaliDayLabel,
  shiftGregorianDate,
  todayGregorian,
  type DashboardToastState,
} from "./_components";
import { dashboardQuietButtonClass } from "./_components/buttonClasses";

const STATUS_FILTERS: Array<{ value: "all" | AppointmentStatus; label: string }> = [
  { value: "all", label: "همه" },
  { value: AppointmentStatus.Scheduled, label: "رزرو" },
  { value: AppointmentStatus.CheckedIn, label: "حضور" },
  { value: AppointmentStatus.Completed, label: "انجام" },
  { value: AppointmentStatus.Cancelled, label: "لغو" },
  { value: AppointmentStatus.NoShow, label: "عدم حضور" },
];

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

export default function DashboardView() {
  const salonId = useSalonContextStore((s) => s.salonId);
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const today = todayGregorian();
  const [date, setDate] = useState(today);
  const [toast, setToast] = useState<DashboardToastState>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | AppointmentStatus>("all");
  const [viewMode, setViewMode] = useState<"agenda" | "grid">("agenda");
  const [bookOpen, setBookOpen] = useState(false);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("لغو توسط سالن");

  const salonDetail = useQuerySalonById(salonPublicId || undefined);
  const branches = salonDetail.data?.data?.branches ?? [];
  const branchFallback = branches[0]?.id;
  const [branchId, setBranchId] = useState<number | "">("");
  const activeBranchId = Number(branchId || branchFallback || 0);

  const offeringsQuery = useQueryCatalogOfferings(true);
  const offerings = offeringsQuery.data?.data ?? [];
  // staff-for-offerings expects Guid offeringPublicIds, not the numeric catalog id.
  const allOfferingIds = useMemo(
    () => offerings.map((o) => o.publicId).filter(Boolean),
    [offerings]
  );

  // Board filters are independent of the quick-book drawer's own branch picker below:
  // leaving them unset must mean "show every branch/staff", not silently fall back to
  // the first branch the way the drawer's own picker (below) intentionally does.
  const [boardBranchId, setBoardBranchId] = useState<number | "">("");
  const [boardStaffId, setBoardStaffId] = useState<number | "">("");
  const hasBoardFilters = !!boardBranchId || !!boardStaffId;

  // No "all staff for a salon" endpoint exists, so this reuses the same
  // staff-for-offerings lookup the quick-book picker relies on, scoped to every
  // currently active offering, as the closest available proxy for "everyone
  // bookable right now".
  const boardStaffQuery = useQueryStaffForOfferings(
    salonPublicId || salonId || undefined,
    allOfferingIds,
    { enabled: allOfferingIds.length > 0 }
  );
  const boardStaff = boardStaffQuery.data?.data ?? [];

  // Unlike the agenda list (where an unset filter means "every branch"), the batch
  // day-board endpoint is always scoped to exactly one branch, so grid mode needs a
  // concrete choice — reuse the same filter when set, else default to the first branch.
  const boardBranchPublicId =
    branches.find((b) => b.id === boardBranchId)?.publicId ?? branches[0]?.publicId;

  const appointmentsQuery = useQuerySalonAppointments(date, {
    pageSize: 100,
    branchId: Number(boardBranchId) || undefined,
    staffMemberId: Number(boardStaffId) || undefined,
  });
  const lifecycle = useMutateSalonLifecycle();
  const quickBook = useMutateQuickBook();
  const { isEntitled, isLoading: entitlementLoading } =
    useSubscriptionEntitlement();
  const bookingLocked = !entitlementLoading && !isEntitled;

  const summaryQuery = useQueryDashboardSummary({ from: date, to: date });
  const summary = summaryQuery.data?.data;
  const collected =
    asNumber(summary?.collected) ??
    metricFromUnknown(summary?.financial?.collected).value;
  const noShowRate =
    asNumber(summary?.noShowRate) ??
    metricFromUnknown(summary?.operational?.noShowRate).value;

  const [offeringId, setOfferingId] = useState<number | "">("");
  const selectedOfferingId = Number(offeringId || 0);
  const selectedOffering = offerings.find((o) => o.id === selectedOfferingId);

  const staffQuery = useQueryStaffForOfferings(
    salonPublicId || salonId || undefined,
    selectedOffering?.publicId ? [selectedOffering.publicId] : [],
    { enabled: !!selectedOffering?.publicId }
  );
  const staff = staffQuery.data?.data ?? [];
  const [staffId, setStaffId] = useState<number | "">("");
  const selectedStaffId = Number(staffId) || 0;
  const selectedStaffMember = staff.find((s) => s.id === selectedStaffId);

  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [time, setTime] = useState("10:00");
  const [notes, setNotes] = useState("");
  const [quickBookErrors, setQuickBookErrors] = useState<TQuickBookFieldErrors>({});
  const [confirmation, setConfirmation] = useState<{
    appointmentId: number;
    startTimeLabel: string;
    staffName: string;
    serviceName: string;
    branchName?: string;
  } | null>(null);

  // A second, narrow query (server-filtered to one staff member) just to check for a
  // conflict before submit — the main board list only carries a display name, not a
  // staff id, so it can't be reused for this on its own.
  const staffDayQuery = useQuerySalonAppointments(
    date,
    { staffMemberId: selectedStaffId, pageSize: 50 },
    { enabled: bookOpen && !!selectedStaffId }
  );
  const conflict = useMemo(() => {
    if (!selectedStaffId || !selectedOffering || !time) return null;
    const candidateStart = toBookingStartTime(date, time);
    return findConflictingAppointment(
      staffDayQuery.data?.data?.items ?? [],
      candidateStart,
      selectedOffering.durationMinutes
    );
  }, [selectedStaffId, selectedOffering, time, date, staffDayQuery.data]);

  const items = useMemo(() => {
    const list = [...(appointmentsQuery.data?.data?.items ?? [])];
    list.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    if (statusFilter === "all") return list;
    return list.filter((x) => Number(x.status) === statusFilter);
  }, [appointmentsQuery.data, statusFilter]);

  const lifecycleBusy =
    lifecycle.checkIn.isPending ||
    lifecycle.complete.isPending ||
    lifecycle.noShow.isPending ||
    lifecycle.cancel.isPending;

  const onQuickBook = async (e: FormEvent) => {
    e.preventDefault();

    if (bookingLocked) {
      setToast({ type: "error", message: SUBSCRIPTION_OWNER_LOCK_MESSAGE });
      return;
    }

    const startTime = toBookingStartTime(date, time);
    const errors = validateQuickBook({
      phone: phone.trim(),
      branchId: activeBranchId,
      offeringId: selectedOfferingId,
      staffId: selectedStaffId,
      startTime,
    });
    if (errors) {
      setQuickBookErrors(errors);
      return;
    }
    setQuickBookErrors({});

    try {
      const res = await quickBook.mutateAsync({
        phone: phone.trim(),
        fullName: fullName.trim() || "میهمان",
        branchId: activeBranchId,
        startTime,
        notes: notes.trim() || null,
        services: [{ offeringId: selectedOfferingId, staffId: selectedStaffId }],
      });
      const staffName =
        selectedStaffMember?.fullName ||
        [selectedStaffMember?.firstName, selectedStaffMember?.lastName]
          .filter(Boolean)
          .join(" ") ||
        "پرسنل";
      setConfirmation({
        appointmentId: res.data?.appointmentId ?? 0,
        startTimeLabel: formatClock(startTime),
        staffName,
        serviceName: selectedOffering?.serviceTypeName || "-",
        branchName: branches.find((b) => b.id === activeBranchId)?.name,
      });
      setPhone("");
      setFullName("");
      setNotes("");
      setBookOpen(false);
    } catch (err) {
      setToast({
        type: "error",
        message: getApiErrorMessage(err, "ثبت رزرو سریع ناموفق بود.", {
          audience: "owner",
        }),
      });
    }
  };

  const doLifecycle = async (
    action: "checkin" | "complete" | "noshow" | "cancel",
    appointmentId: number,
    reason?: string
  ) => {
    try {
      if (action === "checkin") await lifecycle.checkIn.mutateAsync(appointmentId);
      if (action === "complete") await lifecycle.complete.mutateAsync(appointmentId);
      if (action === "noshow") await lifecycle.noShow.mutateAsync(appointmentId);
      if (action === "cancel") {
        await lifecycle.cancel.mutateAsync({
          id: appointmentId,
          reason: reason || "لغو توسط سالن",
        });
      }
      setToast({ type: "success", message: "وضعیت نوبت به‌روزرسانی شد." });
    } catch (err) {
      setToast({
        type: "error",
        message: getApiErrorMessage(err, "به‌روزرسانی وضعیت نوبت ناموفق بود."),
      });
    }
  };

  const confirmCancel = async () => {
    if (cancelId == null) return;
    const reason = cancelReason.trim();
    if (!reason) return;
    await doLifecycle("cancel", cancelId, reason);
    setCancelId(null);
    setCancelReason("لغو توسط سالن");
  };

  return (
    <DashboardPage>
      <DashboardCard>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-background-elevated text-foreground"
            onClick={() => setDate((d) => shiftGregorianDate(d, -1))}
            aria-label="روز قبل"
          >
            <CaretRightIcon size={18} />
          </button>
          <div className="min-w-0 text-center">
            <p className="text-sm font-bold text-foreground">
              {formatJalaliDayLabel(date)}
            </p>
            <p className="text-[11px] text-foreground-muted">تخته روزانه</p>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-background-elevated text-foreground"
            onClick={() => setDate((d) => shiftGregorianDate(d, 1))}
            aria-label="روز بعد"
          >
            <CaretLeftIcon size={18} />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-2">
          <DashboardDateField
            name="dashboard-day"
            value={date}
            onChange={setDate}
          />
          {date !== today ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={dashboardQuietButtonClass}
              onClick={() => setDate(today)}
            >
              امروز
            </Button>
          ) : null}
        </div>
      </DashboardCard>

      <div className="grid grid-cols-3 gap-2">
        <DashboardKpi
          title="نوبت"
          value={String(appointmentsQuery.data?.data?.items?.length ?? 0)}
        />
        <DashboardKpi title="دریافت" value={formatMoneyOrDash(collected)} />
        <DashboardKpi title="عدم حضور" value={formatRate(noShowRate)} />
      </div>

      <div className="flex justify-end gap-1 rounded-full bg-surface p-1">
        <button
          type="button"
          onClick={() => setViewMode("agenda")}
          aria-label="نمای فهرست"
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            viewMode === "agenda"
              ? "bg-primary text-primary-foreground"
              : "text-foreground-muted"
          }`}
        >
          <ListIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => setViewMode("grid")}
          aria-label="نمای جدول پرسنل"
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            viewMode === "grid"
              ? "bg-primary text-primary-foreground"
              : "text-foreground-muted"
          }`}
        >
          <SquaresFourIcon size={16} />
        </button>
      </div>

      {viewMode === "grid" && (
        <DashboardCalendarGrid
          date={date}
          branchPublicId={boardBranchPublicId}
          staff={boardStaff}
          onToast={setToast}
        />
      )}

      {branches.length > 1 && (
        <DashboardSelect
          value={boardBranchId}
          onChange={(e) => setBoardBranchId(Number(e.target.value) || "")}
        >
          {/* Grid mode's batch day-board is always scoped to one branch, so "all
              branches" only makes sense as a filter for the agenda list. */}
          {viewMode === "agenda" && <option value="">همه شعبه‌ها</option>}
          {branches.map((branch) => (
            <option
              key={String(branch.id ?? branch.publicId)}
              value={branch.id ?? ""}
            >
              {branch.name}
            </option>
          ))}
        </DashboardSelect>
      )}

      {viewMode === "agenda" && boardStaff.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setBoardStaffId("")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
              boardStaffId === ""
                ? "bg-primary text-primary-foreground"
                : "bg-surface text-foreground-muted"
            }`}
          >
            همه پرسنل
          </button>
          {boardStaff.map((member) => {
            const label =
              member.fullName ||
              [member.firstName, member.lastName].filter(Boolean).join(" ") ||
              "پرسنل";
            const active = Number(boardStaffId) === member.id;
            return (
              <button
                key={member.id}
                type="button"
                onClick={() =>
                  setBoardStaffId(active ? "" : (member.id as number))
                }
                className={`rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-foreground-muted"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {viewMode === "agenda" && (
      <>
      <div className="flex gap-2 overflow-x-auto">
        {STATUS_FILTERS.map((filter) => {
          const active = statusFilter === filter.value;
          return (
            <button
              key={String(filter.value)}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-foreground-muted"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {appointmentsQuery.isLoading ? (
        <DashboardSkeleton cards={1} rows={4} />
      ) : appointmentsQuery.isError ? (
        <DashboardEmptyState
          title="بارگذاری نوبت‌ها ناموفق بود"
          description="اتصال را بررسی کنید و دوباره تلاش کنید."
        />
      ) : items.length === 0 ? (
        <DashboardEmptyState
          title={
            hasBoardFilters ? "نوبتی با این فیلترها نیست" : "نوبتی برای این روز نیست"
          }
          description={
            hasBoardFilters
              ? "فیلتر شعبه یا پرسنل را پاک کنید یا تاریخ دیگری را ببینید."
              : "رزرو سریع را از دکمه پایین ثبت کنید یا تاریخ دیگری را ببینید."
          }
        />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <DashboardCard key={item.id} className="p-3">
              <div className="flex items-start gap-3">
                <div className="min-w-[4.5rem] text-right">
                  <p className="text-base font-bold text-foreground">
                    {formatClock(item.startTime)}
                  </p>
                  <p className="text-[11px] text-foreground-muted">
                    تا {formatClock(item.endTime)}
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-foreground">
                      {item.services?.map((s) => s.serviceName).join("، ") ||
                        "بدون سرویس"}
                    </p>
                    <AppointmentStatusChip status={Number(item.status)} />
                  </div>
                  <p className="text-xs text-foreground-muted">
                    {item.staffNames || "بدون پرسنل"}
                    {item.branchName ? ` · ${item.branchName}` : ""}
                  </p>
                  <p className="mt-1 text-[11px] text-foreground-muted">
                    {formatAppointmentDateTime(item.startTime)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Number(item.status) === AppointmentStatus.Scheduled && (
                      <>
                        <Button
                          size="sm"
                          disabled={lifecycleBusy}
                          onClick={() => void doLifecycle("checkin", item.id)}
                        >
                          ورود
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={dashboardQuietButtonClass}
                          disabled={lifecycleBusy}
                          onClick={() => void doLifecycle("noshow", item.id)}
                        >
                          عدم حضور
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={dashboardQuietButtonClass}
                          disabled={lifecycleBusy}
                          onClick={() => {
                            setCancelId(item.id);
                            setCancelReason("لغو توسط سالن");
                          }}
                        >
                          لغو
                        </Button>
                      </>
                    )}
                    {Number(item.status) === AppointmentStatus.CheckedIn && (
                      <>
                        <Button
                          size="sm"
                          disabled={lifecycleBusy}
                          onClick={() => void doLifecycle("complete", item.id)}
                        >
                          انجام شد
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={dashboardQuietButtonClass}
                          disabled={lifecycleBusy}
                          onClick={() => void doLifecycle("noshow", item.id)}
                        >
                          عدم حضور
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </DashboardCard>
          ))}
        </div>
      )}
      </>
      )}

      <p className="text-center text-xs text-foreground-muted">
        <Link className="text-primary" href={RouteAddress.RESERVATION.BASE}>
          مشاهده رزروهای مشتری
        </Link>
      </p>

      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30">
        <div className="relative mx-auto max-w-[720px] px-safe-area">
          <button
            type="button"
            onClick={() => setBookOpen(true)}
            className="pointer-events-auto absolute start-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
            aria-label="رزرو سریع"
          >
            <PlusIcon size={24} weight="bold" />
          </button>
        </div>
      </div>

      <Drawer
        open={bookOpen}
        onOpenChange={(open) => {
          setBookOpen(open);
          if (open) setQuickBookErrors({});
        }}
      >
        <DrawerContent className="max-h-[85vh] overflow-y-auto border-border bg-background">
          <DrawerHeader className="text-right">
            <DrawerTitle>رزرو سریع</DrawerTitle>
          </DrawerHeader>
          <form className="grid grid-cols-1 gap-2 px-4 pb-6" onSubmit={onQuickBook}>
            {bookingLocked ? (
              <p className="text-xs text-error">
                {SUBSCRIPTION_OWNER_LOCK_MESSAGE}{" "}
                <Link className="underline" href={RouteAddress.SUBSCRIPTIONS.BASE}>
                  مدیریت اشتراک
                </Link>
              </p>
            ) : null}
            <div>
              <Input
                placeholder="موبایل مشتری"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                hasError={!!quickBookErrors.phone}
              />
              {quickBookErrors.phone && (
                <p className="mt-1 text-xs font-medium text-error">
                  {quickBookErrors.phone}
                </p>
              )}
            </div>
            <Input
              placeholder="نام مشتری"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <div>
              <DashboardSelect
                value={branchId}
                onChange={(e) => setBranchId(Number(e.target.value))}
              >
                <option value="">انتخاب شعبه</option>
                {branches.map((branch) => (
                  <option
                    key={String(branch.id ?? branch.publicId)}
                    value={branch.id ?? ""}
                  >
                    {branch.name}
                  </option>
                ))}
              </DashboardSelect>
              {quickBookErrors.branchId && (
                <p className="mt-1 text-xs font-medium text-error">
                  {quickBookErrors.branchId}
                </p>
              )}
            </div>
            <div>
              <DashboardSelect
                value={selectedOfferingId || ""}
                onChange={(e) => setOfferingId(Number(e.target.value))}
              >
                <option value="">انتخاب سرویس</option>
                {offerings.map((offering) => (
                  <option key={offering.id} value={offering.id}>
                    {offering.serviceTypeName}
                  </option>
                ))}
              </DashboardSelect>
              {quickBookErrors.offeringId && (
                <p className="mt-1 text-xs font-medium text-error">
                  {quickBookErrors.offeringId}
                </p>
              )}
            </div>
            <div>
              <DashboardSelect
                value={selectedStaffId || ""}
                onChange={(e) => setStaffId(Number(e.target.value))}
              >
                <option value="">انتخاب پرسنل</option>
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.fullName ||
                      [member.firstName, member.lastName]
                        .filter(Boolean)
                        .join(" ")}
                  </option>
                ))}
              </DashboardSelect>
              {quickBookErrors.staffId && (
                <p className="mt-1 text-xs font-medium text-error">
                  {quickBookErrors.staffId}
                </p>
              )}
            </div>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            {conflict && (
              <div className="flex items-start gap-2 rounded-[12px] bg-warning-background px-3 py-2 text-xs text-warning-foreground">
                <WarningCircleIcon size={16} className="mt-0.5 shrink-0" />
                <span>
                  این پرسنل در این بازه نوبت دیگری دارد (
                  {formatClock(conflict.startTime)} تا {formatClock(conflict.endTime)}
                  ). می‌توانید ادامه دهید یا زمان دیگری انتخاب کنید.
                </span>
              </div>
            )}
            <Input
              placeholder="یادداشت (اختیاری)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Button
              type="submit"
              isLoading={quickBook.isPending}
              disabled={bookingLocked}
            >
              ثبت رزرو سریع
            </Button>
          </form>
        </DrawerContent>
      </Drawer>

      <Dialog
        open={cancelId != null}
        onOpenChange={(open) => {
          if (!open) setCancelId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>لغو نوبت</DialogTitle>
            <DialogDescription>
              دلیل لغو را وارد کنید. این متن برای مشتری ثبت می‌شود.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="دلیل لغو"
          />
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              className={dashboardQuietButtonClass}
              onClick={() => setCancelId(null)}
            >
              انصراف
            </Button>
            <Button
              type="button"
              onClick={() => void confirmCancel()}
              isLoading={lifecycle.cancel.isPending}
              disabled={!cancelReason.trim()}
            >
              تأیید لغو
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!confirmation}
        onOpenChange={(open) => {
          if (!open) setConfirmation(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رزرو ثبت شد</DialogTitle>
            <DialogDescription>جزئیات نوبت جدید</DialogDescription>
          </DialogHeader>
          {confirmation && (
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">شماره نوبت</span>
                <span className="font-bold text-foreground">
                  #{confirmation.appointmentId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">ساعت</span>
                <span className="font-bold text-foreground">
                  {confirmation.startTimeLabel}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">پرسنل</span>
                <span className="font-bold text-foreground">
                  {confirmation.staffName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">سرویس</span>
                <span className="font-bold text-foreground">
                  {confirmation.serviceName}
                </span>
              </div>
              {confirmation.branchName && (
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted">شعبه</span>
                  <span className="font-bold text-foreground">
                    {confirmation.branchName}
                  </span>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button type="button" onClick={() => setConfirmation(null)}>
              باشه
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DashboardToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardPage>
  );
}
