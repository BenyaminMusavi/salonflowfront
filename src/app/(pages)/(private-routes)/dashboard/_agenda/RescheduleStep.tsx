"use client";

import { useMemo, useState } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { Button } from "@/shared/components/primitives/button/Button";
import { Switch } from "@/shared/components/primitives/switch/Switch";
import {
  useMutateSalonAppointment,
  useQuerySalonAvailability,
} from "@/services/domains/appointments/hooks";
import type {
  ISalonAppointmentDetails,
  ISalonAvailabilitySlot,
} from "@/services/domains/appointments/types/appointments.type";
import { useQueryStaffForOfferings } from "@/services/domains/staff-profile/hooks/useQueryStaffForOfferings";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { utcToSalonYmd } from "@/shared/utils/salonTime";
import { cn } from "@/shared/utils/className";
import { NotifyCustomerCheckbox } from "../_components/NotifyCustomerCheckbox";
import type { DashboardToastState } from "../_components/DashboardToast";
import { formatClock } from "./AgendaRow";
import { DayPicker, dayLabel, pickerChip } from "./DayTimePicker";

/**
 * «جابه‌جایی»: a day, optionally another person, then one of that day's free slots from the
 * salon availability (the appointment itself excluded). Out-of-shift slots on request.
 */
export function RescheduleStep({
  details,
  onBack,
  onDone,
  onToast,
}: {
  details: ISalonAppointmentDetails;
  onBack: () => void;
  onDone: () => void;
  onToast: (t: DashboardToastState) => void;
}) {
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const mutate = useMutateSalonAppointment();
  const offeringIds = useMemo(
    () => Array.from(new Set(details.services.map((s) => s.offeringPublicId))),
    [details.services]
  );
  const currentStaff = Array.from(new Set(details.services.map((s) => s.staffPublicId)));
  const singleStaff = currentStaff.length === 1 ? currentStaff[0] : undefined;

  const [day, setDay] = useState(utcToSalonYmd(details.startTime));
  const [staffPublicId, setStaffPublicId] = useState<string | undefined>(singleStaff);
  const [outside, setOutside] = useState(false);
  const [slot, setSlot] = useState<ISalonAvailabilitySlot | null>(null);
  const [notifyCustomer, setNotifyCustomer] = useState(true);

  // People who can do every service of this appointment (only offered for one-person appointments).
  const candidates =
    useQueryStaffForOfferings(salonPublicId || undefined, offeringIds, {
      enabled: !!singleStaff,
      matchAll: true,
    }).data?.data ?? [];

  const availability = useQuerySalonAvailability({
    from: day,
    to: day,
    offeringPublicIds: offeringIds,
    staffPublicId,
    branchPublicId: details.branch?.publicId,
    excludeAppointmentPublicId: details.publicId,
    includeOutsideHours: outside,
  });
  const slots = availability.data?.data?.days?.find((d) => d.date === day)?.slots ?? [];

  const chosenStaff = staffPublicId ?? slot?.staff[0]?.publicId;
  const staffChanged = !!chosenStaff && !!singleStaff && chosenStaff !== singleStaff;

  const submit = async () => {
    if (!slot) return;
    try {
      await mutate.reschedule.mutateAsync({
        publicId: details.publicId,
        body: {
          newStartTime: slot.startTime,
          newStaffPublicId: staffChanged ? chosenStaff : null,
          notifyCustomer,
          allowOutsideWorkingHours: slot.outsideHours,
        },
      });
      onToast({ type: "success", message: `نوبت به ${dayLabel(day)} ساعت ${formatClock(slot.startTime)} منتقل شد.` });
      onDone();
    } catch (err) {
      onToast({ type: "error", message: getApiErrorMessage(err, "جابه‌جایی نوبت ناموفق بود.") });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onBack} aria-label="بازگشت" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-hover">
          <ArrowRightIcon size={18} />
        </button>
        <p className="text-base font-bold text-foreground">جابه‌جایی نوبت</p>
      </div>
      <p className="text-xs text-foreground-muted">
        {details.customer?.fullName || "مشتری"} · الان {dayLabel(utcToSalonYmd(details.startTime))} ساعت {formatClock(details.startTime)}
      </p>

      <DayPicker
        name="reschedule-day"
        value={day}
        onChange={(d) => {
          setDay(d);
          setSlot(null);
        }}
      />

      {singleStaff && candidates.length > 1 ? (
        <section className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-foreground-muted">پرسنل</p>
          <div className="flex flex-wrap gap-2">
            {candidates.map((c) => (
              <button
                key={c.staffMemberId}
                type="button"
                className={cn(pickerChip(staffPublicId === c.staffPublicId), "px-3")}
                onClick={() => {
                  setStaffPublicId(c.staffPublicId ?? undefined);
                  setSlot(null);
                }}
              >
                {c.firstName || "پرسنل"}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground-muted">ساعت‌های آزاد</p>
          <label className="flex items-center gap-2 text-[11px] text-foreground-muted">
            خارج از شیفت هم
            <Switch checked={outside} onCheckedChange={(v) => { setOutside(v); setSlot(null); }} />
          </label>
        </div>
        {availability.isLoading ? (
          <p className="text-xs text-foreground-muted">در حال یافتن ساعت‌های آزاد…</p>
        ) : slots.length === 0 ? (
          <p className="rounded-[12px] bg-background-secondary px-3 py-3 text-xs text-foreground-muted">
            در این روز ساعت آزادی نیست. روز دیگری انتخاب کنید{outside ? "" : " یا «خارج از شیفت» را روشن کنید"}.
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-1.5">
            {slots.map((s) => (
              <button
                key={s.startTime}
                type="button"
                onClick={() => setSlot(s)}
                className={cn(
                  pickerChip(slot?.startTime === s.startTime),
                  "px-0",
                  s.outsideHours && slot?.startTime !== s.startTime && "border border-dashed border-warning text-warning"
                )}
              >
                {formatClock(s.startTime)}
              </button>
            ))}
          </div>
        )}
        {slot?.outsideHours ? (
          <p className="text-[11px] text-warning">این ساعت خارج از شیفت پرسنل است.</p>
        ) : null}
      </section>

      <NotifyCustomerCheckbox checked={notifyCustomer} onChange={setNotifyCustomer} />

      <Button type="button" className="w-full rounded-[12px]" disabled={!slot} isLoading={mutate.reschedule.isPending} onClick={() => void submit()}>
        {slot ? `ثبت ${dayLabel(day)} · ${formatClock(slot.startTime)}` : "یک ساعت انتخاب کنید"}
      </Button>
    </div>
  );
}
