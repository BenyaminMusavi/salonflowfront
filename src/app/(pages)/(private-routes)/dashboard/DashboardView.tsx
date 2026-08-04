"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/shared/components/primitives/button/Button";
import { Input } from "@/shared/components/primitives/input/Input";
import { AppointmentStatus } from "@/services/common/enums/domain-enums";
import {
  appointmentStatusClass,
  appointmentStatusLabel,
  formatAppointmentDateTime,
} from "@/services/domains/appointments/utils/appointment-display";
import {
  useMutateQuickBook,
  useMutateSalonLifecycle,
  useQuerySalonAppointments,
} from "@/services/domains/appointments/hooks";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { useQuerySalonOfferings } from "@/services/domains/salon-offering/hooks/useQuerySalonOfferings";
import { useQueryStaffForOfferings } from "@/services/domains/staff-profile/hooks/useQueryStaffForOfferings";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import Link from "next/link";
import { RouteAddress } from "@/shared/data/routeAddress";

const STATUS_GROUPS: Array<{ status: AppointmentStatus; label: string }> = [
  { status: AppointmentStatus.Scheduled, label: "رزرو شده" },
  { status: AppointmentStatus.CheckedIn, label: "حضور ثبت شده" },
  { status: AppointmentStatus.Completed, label: "انجام شده" },
  { status: AppointmentStatus.Cancelled, label: "لغو شده" },
  { status: AppointmentStatus.NoShow, label: "عدم حضور" },
];

const toDateOnly = (d: Date) => {
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function DashboardView() {
  const salonId = useSalonContextStore((s) => s.salonId);
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const today = toDateOnly(new Date());
  const [date, setDate] = useState(today);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const appointmentsQuery = useQuerySalonAppointments(date, { pageSize: 100 });
  const lifecycle = useMutateSalonLifecycle();
  const quickBook = useMutateQuickBook();

  const salonDetail = useQuerySalonById(salonPublicId || undefined);
  const branches = salonDetail.data?.data?.branches ?? [];
  const branchFallback = branches[0]?.id;
  const [branchId, setBranchId] = useState<number | "">("");
  const activeBranchId = Number(branchId || branchFallback || 0);

  const offeringsQuery = useQuerySalonOfferings(salonId ?? 0, {
    enabled: !!salonId,
  });
  const offerings = offeringsQuery.data?.data ?? [];
  const [offeringId, setOfferingId] = useState<number | "">("");
  const selectedOfferingId = Number(offeringId || 0);

  const staffQuery = useQueryStaffForOfferings(
    salonPublicId || salonId || undefined,
    selectedOfferingId ? [selectedOfferingId] : [],
    { enabled: !!selectedOfferingId }
  );
  const staff = staffQuery.data?.data ?? [];
  const [staffId, setStaffId] = useState<number | "">("");

  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [time, setTime] = useState("10:00");
  const [notes, setNotes] = useState("");

  const grouped = useMemo(() => {
    const items = appointmentsQuery.data?.data?.items ?? [];
    return STATUS_GROUPS.map((g) => ({
      ...g,
      items: items.filter((x) => Number(x.status) === g.status),
    }));
  }, [appointmentsQuery.data]);

  const onQuickBook = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!activeBranchId || !selectedOfferingId || !Number(staffId) || !date || !time) {
      setError("همه فیلدهای رزرو سریع را تکمیل کنید.");
      return;
    }

    try {
      const startTime = `${date}T${time.length === 5 ? `${time}:00` : time}`;
      const res = await quickBook.mutateAsync({
        phone: phone.trim(),
        fullName: fullName.trim() || "میهمان",
        branchId: activeBranchId,
        startTime,
        notes: notes.trim() || null,
        services: [{ offeringId: selectedOfferingId, staffId: Number(staffId) }],
      });
      setSuccess(`رزرو ثبت شد. شماره نوبت: ${res.data?.appointmentId ?? "-"}`);
      setPhone("");
      setFullName("");
      setNotes("");
    } catch (err) {
      setError(getApiErrorMessage(err, "ثبت رزرو سریع ناموفق بود."));
    }
  };

  const doLifecycle = async (
    action: "checkin" | "complete" | "noshow" | "cancel",
    appointmentId: number
  ) => {
    setError("");
    setSuccess("");
    try {
      if (action === "checkin") await lifecycle.checkIn.mutateAsync(appointmentId);
      if (action === "complete") await lifecycle.complete.mutateAsync(appointmentId);
      if (action === "noshow") await lifecycle.noShow.mutateAsync(appointmentId);
      if (action === "cancel") {
        const reason = window.prompt("دلیل لغو را وارد کنید", "لغو توسط سالن");
        if (!reason) return;
        await lifecycle.cancel.mutateAsync({ id: appointmentId, reason });
      }
      setSuccess("وضعیت نوبت به‌روزرسانی شد.");
    } catch (err) {
      setError(getApiErrorMessage(err, "به‌روزرسانی وضعیت نوبت ناموفق بود."));
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-col gap-4 px-safe-area pb-8">
      <div className="rounded-lg bg-surface-secondary p-3">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-base font-bold text-foreground">تخته روزانه</h1>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 min-h-10"
            inputWrapperClassname="w-[150px]"
          />
        </div>
        <p className="text-xs text-foreground-muted">
          نوبت‌های امروز را بر اساس وضعیت مدیریت کنید.
        </p>
      </div>

      <div className="rounded-lg bg-surface-secondary p-3">
        <h2 className="mb-3 text-sm font-bold text-foreground">رزرو سریع (Walk-in/Phone)</h2>
        <form className="grid grid-cols-1 gap-2" onSubmit={onQuickBook}>
          <Input
            placeholder="موبایل مشتری"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            placeholder="نام مشتری"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <select
            className="h-12 rounded-[2px] bg-foreground/5 px-3 text-sm text-foreground"
            value={branchId}
            onChange={(e) => setBranchId(Number(e.target.value))}
          >
            <option value="">انتخاب شعبه</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
          <select
            className="h-12 rounded-[2px] bg-foreground/5 px-3 text-sm text-foreground"
            value={selectedOfferingId || ""}
            onChange={(e) => setOfferingId(Number(e.target.value))}
          >
            <option value="">انتخاب سرویس</option>
            {offerings.map((offering) => (
              <option key={offering.id} value={offering.id}>
                {offering.serviceName}
              </option>
            ))}
          </select>
          <select
            className="h-12 rounded-[2px] bg-foreground/5 px-3 text-sm text-foreground"
            value={Number(staffId) || ""}
            onChange={(e) => setStaffId(Number(e.target.value))}
          >
            <option value="">انتخاب پرسنل</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.fullName || [member.firstName, member.lastName].filter(Boolean).join(" ")}
              </option>
            ))}
          </select>
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          <Input
            placeholder="یادداشت (اختیاری)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Button type="submit" isLoading={quickBook.isPending}>
            ثبت رزرو سریع
          </Button>
        </form>
      </div>

      <div className="rounded-lg bg-surface-secondary p-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">لیست نوبت‌ها</h2>
          <Link className="text-xs text-primary underline" href={RouteAddress.RESERVATION.BASE}>
            مشاهده رزروهای مشتری
          </Link>
        </div>

        {appointmentsQuery.isLoading ? (
          <p className="text-sm text-foreground-muted">در حال بارگذاری نوبت‌ها…</p>
        ) : appointmentsQuery.isError ? (
          <p className="text-sm text-error">بارگذاری نوبت‌ها ناموفق بود.</p>
        ) : (
          <div className="space-y-4">
            {grouped.map((group) => (
              <div key={group.status}>
                <p className="mb-2 text-xs font-bold text-foreground-muted">
                  {group.label} ({group.items.length})
                </p>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <div key={item.id} className="rounded-md border border-border p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-foreground">
                          {item.staffNames || "بدون پرسنل"}
                        </p>
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${appointmentStatusClass(
                            Number(item.status)
                          )}`}
                        >
                          {appointmentStatusLabel(Number(item.status))}
                        </span>
                      </div>
                      <p className="text-xs text-foreground-muted">
                        {formatAppointmentDateTime(item.startTime)} تا{" "}
                        {formatAppointmentDateTime(item.endTime)}
                      </p>
                      <p className="mt-1 text-xs text-foreground-muted">
                        {item.services?.map((s) => s.serviceName).join("، ") || "بدون سرویس"}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {Number(item.status) === AppointmentStatus.Scheduled && (
                          <>
                            <Button size="sm" onClick={() => doLifecycle("checkin", item.id)}>
                              Check-In
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => doLifecycle("noshow", item.id)}
                            >
                              NoShow
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => doLifecycle("cancel", item.id)}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {Number(item.status) === AppointmentStatus.CheckedIn && (
                          <>
                            <Button size="sm" onClick={() => doLifecycle("complete", item.id)}>
                              Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => doLifecycle("noshow", item.id)}
                            >
                              NoShow
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {group.items.length === 0 && (
                    <p className="text-xs text-foreground-muted">موردی در این وضعیت وجود ندارد.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error ? <p className="text-sm text-error">{error}</p> : null}
      {success ? <p className="text-sm text-primary">{success}</p> : null}
    </div>
  );
}

