"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { MagnifyingGlassIcon, UserPlusIcon, WarningCircleIcon, XIcon } from "@phosphor-icons/react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/shared/components/primitives/drawer/Drawer";
import { Button } from "@/shared/components/primitives/button/Button";
import { Input } from "@/shared/components/primitives/input/Input";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { useQueryCatalogOfferings } from "@/services/domains/catalog/hooks";
import { useQueryStaffForOfferings } from "@/services/domains/staff-profile/hooks/useQueryStaffForOfferings";
import { useQueryCustomers } from "@/services/domains/customers/hooks";
import type { ICustomer } from "@/services/domains/customers/types/customers.type";
import {
  useMutateQuickBook,
  useQuerySalonAppointments,
} from "@/services/domains/appointments/hooks";
import { findConflictingAppointment } from "@/services/domains/appointments/utils/conflictCheck";
import { validateQuickBook } from "@/services/domains/appointments/utils/quickBookValidation";
import { useSubscriptionEntitlement } from "@/services/domains/subscriptions/hooks/useSubscriptionEntitlement";
import {
  getApiErrorMessage,
  SUBSCRIPTION_OWNER_LOCK_MESSAGE,
  toBookingStartTime,
} from "@/services/domains/booking/utils/booking-mappers";
import { RouteAddress } from "@/shared/data/routeAddress";
import { useMediaQuery } from "@/shared/hooks";
import { normalizePhoneInput } from "@/shared/utils/phoneInput";
import { panelSheetClass } from "./_components/panelSheet";
import { salonClockParts, salonTodayYmd } from "@/shared/utils/salonTime";
import { cn } from "@/shared/utils/className";
import type { DashboardToastState } from "./_components";
import { formatClock } from "./_agenda/AgendaRow";
import { DayPicker, TimePicker, dayLabel, pad2, pickerChip } from "./_agenda/DayTimePicker";

const PHONE_RULE = /^09\d{9}$/;

interface QuickBookDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Salon day the drawer opens on (the day the appointments page shows). */
  date: string;
  /** Pre-picked customer (from their page); the search starts empty otherwise. */
  initialCustomer?: { phone: string; fullName: string } | null;
  onToast: (toast: DashboardToastState) => void;
}

type CustomerChoice = { phone: string; fullName: string; isNew: boolean } | null;

/** Next quarter hour today (within opening-ish hours), else 10:00. */
function defaultTime(day: string): { hour: number; minute: number } {
  if (day !== salonTodayYmd()) return { hour: 10, minute: 0 };
  const { hours, minutes } = salonClockParts(new Date(Date.now() + 15 * 60000));
  const minute = Math.ceil(minutes / 15) * 15;
  const hour = Math.min(22, Math.max(7, hours + (minute === 60 ? 1 : 0)));
  return { hour, minute: minute === 60 ? 0 : minute };
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-foreground-muted">{children}</p>;
}

/**
 * «نوبت جدید» — one short sheet: customer (search or new) → services → staff → day & time.
 * Books through quick-book (find-or-create by phone), so known and new customers share a path.
 */
export default function QuickBookDrawer({
  open,
  onOpenChange,
  date,
  initialCustomer,
  onToast,
}: QuickBookDrawerProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const salonId = useSalonContextStore((s) => s.salonId);
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const branches = useQuerySalonById(salonPublicId || undefined).data?.data?.branches ?? [];
  const offerings = (useQueryCatalogOfferings(false).data?.data ?? []).filter((o) => o.isActive);
  const quickBook = useMutateQuickBook();
  const { isEntitled, isLoading: entitlementLoading } = useSubscriptionEntitlement();
  const bookingLocked = !entitlementLoading && !isEntitled;

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [customer, setCustomer] = useState<CustomerChoice>(null);
  const [offeringIds, setOfferingIds] = useState<number[]>([]);
  const [staffId, setStaffId] = useState<number | null>(null);
  const [branchId, setBranchId] = useState<number | null>(null);
  const [day, setDay] = useState(date);
  const [hour, setHour] = useState(10);
  const [minute, setMinute] = useState(0);
  const [notes, setNotes] = useState("");
  const [notesOpen, setNotesOpen] = useState(false);
  const [error, setError] = useState("");

  // Every opening starts clean on the day the page shows.
  useEffect(() => {
    if (!open) return;
    setSearch("");
    setDebounced("");
    setCustomer(initialCustomer ? { ...initialCustomer, isNew: false } : null);
    setOfferingIds([]);
    setStaffId(null);
    setBranchId(null);
    setDay(date);
    const t = defaultTime(date);
    setHour(t.hour);
    setMinute(t.minute);
    setNotes("");
    setNotesOpen(false);
    setError("");
  }, [open, date, initialCustomer]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const searchDigits = normalizePhoneInput(search);
  const looksLikePhone = /^0?9\d*$/.test(searchDigits) && searchDigits.length >= 4;
  const customersQuery = useQueryCustomers(looksLikePhone ? searchDigits : debounced, 1);
  const matches: ICustomer[] =
    customer || debounced.length < 2 ? [] : (customersQuery.data?.data?.items ?? []).slice(0, 5);
  const canCreateFromPhone =
    PHONE_RULE.test(searchDigits) && !matches.some((c) => c.phone === searchDigits);

  const selectedOfferings = offerings.filter((o) => offeringIds.includes(o.id));
  const totalMinutes = selectedOfferings.reduce((sum, o) => sum + (o.durationMinutes || 0), 0);
  const staffQuery = useQueryStaffForOfferings(
    salonPublicId || salonId || undefined,
    selectedOfferings.map((o) => o.publicId),
    { enabled: selectedOfferings.length > 0, matchAll: true }
  );
  const staff = staffQuery.data?.data ?? [];
  const selectedStaff = staff.find((s) => s.staffMemberId === staffId);

  // One bookable person → pick them; a person who can't do the new selection → clear.
  useEffect(() => {
    if (staff.length === 1) setStaffId(staff[0].staffMemberId);
    else if (staffId && !staff.some((s) => s.staffMemberId === staffId)) setStaffId(null);
  }, [staff, staffId]);

  const activeBranchId = branchId ?? branches[0]?.branchId ?? 0;
  const time = `${pad2(hour)}:${pad2(minute)}`;
  const startTime = toBookingStartTime(day, time);

  const staffDay = useQuerySalonAppointments(
    day,
    { staffMemberId: staffId ?? undefined, pageSize: 50 },
    { enabled: open && !!staffId }
  );
  const conflict = useMemo(() => {
    if (!staffId || totalMinutes <= 0) return null;
    return findConflictingAppointment(
      (staffDay.data?.data?.items ?? []).filter((x) => ![3, 4].includes(Number(x.status))),
      startTime,
      totalMinutes
    );
  }, [staffId, totalMinutes, startTime, staffDay.data]);

  const toggleOffering = (id: number) =>
    setOfferingIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const pickCustomer = (c: ICustomer) => {
    setCustomer({ phone: c.phone, fullName: c.fullName, isNew: false });
    setSearch("");
  };

  const ready = !!customer && offeringIds.length > 0 && !!staffId && !!activeBranchId;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (bookingLocked) {
      setError(SUBSCRIPTION_OWNER_LOCK_MESSAGE);
      return;
    }
    if (!customer || !staffId) return;
    const errors = validateQuickBook({
      phone: customer.phone,
      branchId: activeBranchId,
      offeringId: offeringIds[0] ?? 0,
      staffId,
      startTime,
    });
    if (errors) {
      setError(Object.values(errors)[0] ?? "اطلاعات نوبت کامل نیست.");
      return;
    }
    setError("");
    try {
      await quickBook.mutateAsync({
        phone: customer.phone,
        fullName: customer.fullName.trim() || "میهمان",
        branchId: activeBranchId,
        startTime,
        notes: notes.trim() || null,
        services: offeringIds.map((offeringId) => ({ offeringId, staffId })),
      });
      onToast({
        type: "success",
        message: `نوبت ${customer.fullName.trim() || "مشتری"} برای ${dayLabel(day)} ساعت ${time} ثبت شد.`,
      });
      onOpenChange(false);
    } catch (err) {
      setError(getApiErrorMessage(err, "ثبت نوبت ناموفق بود.", { audience: "owner" }));
    }
  };

  const summary = [dayLabel(day), time, selectedStaff?.firstName].filter(Boolean).join(" · ");

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={isDesktop ? "left" : "bottom"} repositionInputs={false}>
      <DrawerContent className={cn("border-border bg-background", panelSheetClass(isDesktop, 440))}>
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-safe-area pb-4 pt-2 lg:px-6 lg:pt-6">
            <div>
              <DrawerTitle className="text-base font-bold">نوبت جدید</DrawerTitle>
              <DrawerDescription className="sr-only">ثبت نوبت تلفنی یا حضوری</DrawerDescription>
            </div>

            {bookingLocked ? (
              <p className="rounded-[12px] bg-error-background px-3 py-2 text-xs text-error-foreground">
                {SUBSCRIPTION_OWNER_LOCK_MESSAGE}{" "}
                <Link className="underline" href={RouteAddress.SUBSCRIPTIONS.BASE}>
                  مدیریت اشتراک
                </Link>
              </p>
            ) : null}

            <section className="flex flex-col gap-2">
              <SectionTitle>مشتری</SectionTitle>
              {customer ? (
                <div className="flex flex-col gap-2 rounded-[16px] bg-background-secondary p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-brand text-sm font-bold text-content-brand">
                      {(customer.fullName || "م").charAt(0)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground">
                        {customer.isNew ? "مشتری جدید" : customer.fullName || "بدون نام"}
                      </p>
                      <p className="text-xs text-foreground-muted" dir="ltr">
                        {customer.phone}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCustomer(null)}
                      aria-label="تغییر مشتری"
                      className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-hover"
                    >
                      <XIcon size={16} />
                    </button>
                  </div>
                  {customer.isNew ? (
                    <Input
                      value={customer.fullName}
                      onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                      placeholder="نام و نام خانوادگی (اختیاری)"
                      className="rounded-[12px]"
                      autoFocus
                    />
                  ) : null}
                </div>
              ) : (
                <>
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="نام یا موبایل مشتری"
                    className="rounded-[12px]"
                    startIcon={<MagnifyingGlassIcon size={18} />}
                    autoComplete="off"
                    // Always the normal keyboard: switching to the number pad mid-typing
                    // (once the text looked like a phone) was confusing. Persian/Arabic digits
                    // are still normalised for the search.
                    inputMode="text"
                    enterKeyHint="search"
                  />
                  {matches.length > 0 || canCreateFromPhone ? (
                    <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
                      {matches.map((c) => (
                        <button
                          key={c.publicId}
                          type="button"
                          onClick={() => pickCustomer(c)}
                          className="flex items-center justify-between gap-3 px-4 py-3 text-right hover:bg-surface-hover"
                        >
                          <span className="truncate text-sm font-semibold text-foreground">
                            {c.fullName || "بدون نام"}
                          </span>
                          <span className="shrink-0 text-xs text-foreground-muted" dir="ltr">
                            {c.phone}
                          </span>
                        </button>
                      ))}
                      {canCreateFromPhone ? (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomer({ phone: searchDigits, fullName: "", isNew: true });
                            setSearch("");
                          }}
                          className="flex items-center gap-2 px-4 py-3 text-right text-sm font-semibold text-primary hover:bg-surface-hover"
                        >
                          <UserPlusIcon size={18} />
                          مشتری جدید با <span dir="ltr">{searchDigits}</span>
                        </button>
                      ) : null}
                    </div>
                  ) : debounced.length >= 2 && !customersQuery.isFetching ? (
                    <p className="px-1 text-xs text-foreground-muted">
                      مشتری‌ای پیدا نشد. برای مشتری جدید، شماره‌ی موبایلش را کامل وارد کنید.
                    </p>
                  ) : null}
                </>
              )}
            </section>

            <section className="flex flex-col gap-2">
              <SectionTitle>خدمت</SectionTitle>
              {offerings.length === 0 ? (
                <p className="text-xs text-foreground-muted">هنوز خدمت فعالی تعریف نشده.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {offerings.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => toggleOffering(o.id)}
                      className={cn(pickerChip(offeringIds.includes(o.id)), "px-3")}
                    >
                      {o.serviceTypeName}
                    </button>
                  ))}
                </div>
              )}
              {totalMinutes > 0 ? (
                <p className="px-1 text-[11px] text-foreground-muted">مدت حدودی: {totalMinutes} دقیقه</p>
              ) : null}
            </section>

            {offeringIds.length > 0 ? (
              <section className="flex flex-col gap-2">
                <SectionTitle>پرسنل</SectionTitle>
                {staffQuery.isLoading ? (
                  <p className="text-xs text-foreground-muted">در حال بارگذاری…</p>
                ) : staff.length === 0 ? (
                  <p className="text-xs text-foreground-muted">
                    کسی همه‌ی این خدمت‌ها را انجام نمی‌دهد. یکی از خدمت‌ها را بردارید.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {staff.map((s) => (
                      <button
                        key={s.staffMemberId}
                        type="button"
                        onClick={() => setStaffId(s.staffMemberId)}
                        className={cn(pickerChip(staffId === s.staffMemberId), "px-3")}
                      >
                        {s.firstName || "پرسنل"}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            ) : null}

            {branches.length > 1 ? (
              <section className="flex flex-col gap-2">
                <SectionTitle>شعبه</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {branches.map((b) => (
                    <button
                      key={b.publicId}
                      type="button"
                      onClick={() => setBranchId(b.branchId)}
                      className={cn(pickerChip(activeBranchId === b.branchId), "px-3")}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            <DayPicker name="quick-book-day" value={day} onChange={setDay} />
            <TimePicker
              hour={hour}
              minute={minute}
              onChange={(h, m) => {
                setHour(h);
                setMinute(m);
              }}
            />

            {conflict ? (
              <div className="flex items-start gap-2 rounded-[12px] bg-warning-background px-3 py-2 text-xs text-warning-foreground">
                <WarningCircleIcon size={16} className="mt-0.5 shrink-0" />
                <span>
                  {selectedStaff?.firstName || "این پرسنل"} از {formatClock(conflict.startTime)} تا{" "}
                  {formatClock(conflict.endTime)} نوبت دیگری دارد. می‌توانید ساعت دیگری انتخاب کنید.
                </span>
              </div>
            ) : null}

            {notesOpen ? (
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="یادداشت (اختیاری)"
                className="rounded-[12px]"
                autoFocus
              />
            ) : (
              <button
                type="button"
                onClick={() => setNotesOpen(true)}
                className="self-start text-xs font-semibold text-primary"
              >
                ＋ یادداشت
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-border px-safe-area pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 lg:px-6">
            {error ? <p className="text-xs font-medium text-error">{error}</p> : null}
            <Button
              type="submit"
              className="w-full rounded-[12px]"
              disabled={!ready || bookingLocked}
              isLoading={quickBook.isPending}
            >
              {ready ? `ثبت نوبت · ${summary}` : "ثبت نوبت"}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
