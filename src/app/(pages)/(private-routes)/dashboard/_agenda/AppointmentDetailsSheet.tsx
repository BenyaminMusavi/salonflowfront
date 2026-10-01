"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRightIcon, DotsThreeIcon, XIcon } from "@phosphor-icons/react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/shared/components/primitives/drawer/Drawer";
import { Button } from "@/shared/components/primitives/button/Button";
import { AppointmentStatus } from "@/services/common/enums/domain-enums";
import type { IAgendaItem } from "@/services/domains/appointments/types/appointments.type";
import { useMutateSalonLifecycle } from "@/services/domains/appointments/hooks";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { RouteAddress } from "@/shared/data/routeAddress";
import { useMediaQuery } from "@/shared/hooks";
import { formatToman } from "@/shared/utils/salonDisplay";
import {
  addDaysYmd,
  formatSalonDate,
  salonTodayYmd,
  salonWallClockToUtcIso,
  utcToSalonTime,
  utcToSalonYmd,
  ymdToDate,
} from "@/shared/utils/salonTime";
import { cn } from "@/shared/utils/className";
import CancelAppointmentDialog from "../CancelAppointmentDialog";
import NoShowDialog from "../NoShowDialog";
import { DashboardDateField } from "../_components/DashboardDateField";
import { NotifyCustomerCheckbox } from "../_components/NotifyCustomerCheckbox";
import type { DashboardToastState } from "../_components/DashboardToast";
import { dashboardQuietButtonClass } from "../_components/buttonClasses";
import { StatusMark, formatClock } from "./AgendaRow";
import { durationMinutes } from "./agendaUtils";

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 07–22
const MINUTES = [0, 15, 30, 45];
const pad = (n: number) => String(n).padStart(2, "0");

function dayLabel(ymd: string): string {
  try {
    return formatSalonDate(ymdToDate(ymd), { weekday: "long", day: "numeric", month: "long" });
  } catch {
    return ymd;
  }
}

const chip = (active: boolean) =>
  cn(
    "shrink-0 rounded-full px-2 py-1.5 text-xs font-semibold tabular-nums transition-colors",
    active ? "bg-primary text-primary-foreground" : "bg-surface-hover text-foreground-muted"
  );

/** «جابه‌جایی»: pick a day and a 15-minute slot; SMS on by default (backend contract). */
function RescheduleStep({
  item,
  onBack,
  onDone,
  onToast,
}: {
  item: IAgendaItem;
  onBack: () => void;
  onDone: () => void;
  onToast: (t: DashboardToastState) => void;
}) {
  const lifecycle = useMutateSalonLifecycle();
  const today = salonTodayYmd();
  const [day, setDay] = useState(utcToSalonYmd(item.startTime));
  const [initialH, initialM] = utcToSalonTime(item.startTime).split(":").map(Number);
  const [hour, setHour] = useState(initialH);
  const [minute, setMinute] = useState(MINUTES.includes(initialM) ? initialM : 0);
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const time = `${pad(hour)}:${pad(minute)}`;
  const unchanged = day === utcToSalonYmd(item.startTime) && time === formatClock(item.startTime);

  const submit = async () => {
    try {
      await lifecycle.reschedule.mutateAsync({
        id: item.numericId,
        newStartTime: salonWallClockToUtcIso(day, time),
        notifyCustomer,
      });
      onToast({ type: "success", message: `نوبت به ${dayLabel(day)} ساعت ${time} منتقل شد.` });
      onDone();
    } catch (err) {
      onToast({ type: "error", message: getApiErrorMessage(err, "جابه‌جایی نوبت ناموفق بود.") });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="بازگشت"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-hover"
        >
          <ArrowRightIcon size={18} />
        </button>
        <DrawerTitle className="text-base font-bold">جابه‌جایی نوبت</DrawerTitle>
      </div>
      <DrawerDescription className="text-xs text-foreground-muted">
        {item.customerName || "مشتری"} · الان {dayLabel(utcToSalonYmd(item.startTime))} ساعت{" "}
        {formatClock(item.startTime)}
      </DrawerDescription>

      <section className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-foreground-muted">روز</p>
        <div className="flex gap-2">
          <button type="button" className={chip(day === today)} onClick={() => setDay(today)}>
            امروز
          </button>
          <button
            type="button"
            className={chip(day === addDaysYmd(today, 1))}
            onClick={() => setDay(addDaysYmd(today, 1))}
          >
            فردا
          </button>
        </div>
        <DashboardDateField name="reschedule-day" value={day} onChange={(d) => d && setDay(d)} />
      </section>

      <section className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-foreground-muted">ساعت</p>
        <div className="grid grid-cols-8 gap-1.5">
          {HOURS.map((h) => (
            <button key={h} type="button" className={chip(h === hour)} onClick={() => setHour(h)}>
              {pad(h)}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-1 rounded-full bg-surface-hover p-1">
          {MINUTES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMinute(m)}
              className={cn(
                "rounded-full py-1.5 text-xs font-semibold tabular-nums",
                m === minute ? "bg-primary text-primary-foreground" : "text-foreground-muted"
              )}
            >
              {pad(m)}
            </button>
          ))}
        </div>
      </section>

      <NotifyCustomerCheckbox checked={notifyCustomer} onChange={setNotifyCustomer} />

      <Button
        type="button"
        className="w-full rounded-[12px]"
        disabled={unchanged}
        isLoading={lifecycle.reschedule.isPending}
        onClick={() => void submit()}
      >
        ثبت {dayLabel(day)} · {time}
      </Button>
    </div>
  );
}

/**
 * Appointment details — bottom sheet on mobile, side panel on desktop. One primary action per
 * status; reschedule is a second step in the same sheet; cancel / no-show sit behind «⋯» and
 * always confirm.
 */
export function AppointmentDetailsSheet({
  item,
  isStaff,
  showBranch,
  onClose,
  onToast,
}: {
  item: IAgendaItem | null;
  isStaff: boolean;
  showBranch: boolean;
  onClose: () => void;
  onToast: (t: DashboardToastState) => void;
}) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const lifecycle = useMutateSalonLifecycle();
  const [step, setStep] = useState<"details" | "reschedule">("details");
  const [moreOpen, setMoreOpen] = useState(false);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [noShowId, setNoShowId] = useState<number | null>(null);

  const itemId = item?.numericId;
  useEffect(() => {
    setStep("details");
    setMoreOpen(false);
  }, [itemId]);

  const busy =
    lifecycle.checkIn.isPending || lifecycle.complete.isPending || lifecycle.noShow.isPending;

  const run = async (fn: () => Promise<unknown>, success: string, failure: string) => {
    try {
      await fn();
      onToast({ type: "success", message: success });
    } catch (err) {
      onToast({ type: "error", message: getApiErrorMessage(err, failure) });
    }
  };

  const status = Number(item?.status);
  const subject = item
    ? `${item.customerName || "مشتری"} · ${dayLabel(utcToSalonYmd(item.startTime))} ${formatClock(item.startTime)}`
    : undefined;
  const canReschedule = status === AppointmentStatus.Scheduled;
  const canCancel = status === AppointmentStatus.Scheduled;
  const canNoShow =
    status === AppointmentStatus.Scheduled || status === AppointmentStatus.CheckedIn;

  return (
    <>
      <Drawer
        open={!!item}
        onOpenChange={(open) => !open && onClose()}
        direction={isDesktop ? "left" : "bottom"}
      >
        <DrawerContent
          className={cn(
            "border-border bg-background",
            isDesktop ? "h-full w-[420px] max-w-[420px] sm:max-w-[420px]" : "max-h-[88vh]"
          )}
        >
          {item ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-safe-area pb-6 pt-2 lg:px-6 lg:pt-6">
              {step === "reschedule" ? (
                <RescheduleStep
                  item={item}
                  onBack={() => setStep("details")}
                  onDone={() => setStep("details")}
                  onToast={onToast}
                />
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <StatusMark status={status} />
                      <DrawerTitle className="mt-1 text-base font-bold">
                        {dayLabel(utcToSalonYmd(item.startTime))}
                      </DrawerTitle>
                      <DrawerDescription className="text-sm tabular-nums text-foreground-muted">
                        {formatClock(item.startTime)} تا {formatClock(item.endTime)} ·{" "}
                        {durationMinutes(item)} دقیقه
                      </DrawerDescription>
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="بستن"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-surface-hover"
                    >
                      <XIcon size={18} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-brand text-base font-bold text-content-brand">
                      {(item.customerName || "م").charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-foreground">
                        {item.customerName || "مشتری"}
                      </p>
                      {showBranch && item.branchName ? (
                        <p className="text-xs text-foreground-muted">شعبه {item.branchName}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-col divide-y divide-border rounded-[16px] bg-background-secondary">
                    {item.services.map((s, i) => (
                      <div key={`${s.name}-${i}`} className="flex items-start justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">{s.name}</p>
                          <p className="text-xs text-foreground-muted">
                            {[s.staffName || (item.services.length === 1 ? item.staffNames : null), `${s.durationMinutes} دقیقه`]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm tabular-nums text-foreground">
                          {formatToman(s.price)}
                        </p>
                      </div>
                    ))}
                    <div className="flex items-center justify-between px-4 py-3">
                      <p className="text-sm text-foreground-muted">جمع</p>
                      <p className="text-sm font-bold tabular-nums text-foreground">
                        {formatToman(item.totalPrice)} تومان
                      </p>
                    </div>
                  </div>

                  {status === AppointmentStatus.Completed && !isStaff ? (
                    <div className="flex items-center justify-between gap-3 rounded-[16px] bg-background-secondary px-4 py-3">
                      <p className="text-xs leading-5 text-foreground-muted">
                        فاکتور و پرداخت این نوبت را از «مالی» ثبت کنید.
                      </p>
                      <Link
                        href={RouteAddress.DASHBOARD.FINANCE}
                        className="shrink-0 text-xs font-semibold text-primary"
                      >
                        ثبت پرداخت
                      </Link>
                    </div>
                  ) : null}

                  {moreOpen ? (
                    <div className="flex flex-col divide-y divide-border rounded-[16px] bg-background-secondary">
                      {canNoShow ? (
                        <button
                          type="button"
                          onClick={() => setNoShowId(item.numericId)}
                          className="px-4 py-3 text-right text-sm font-semibold text-foreground hover:bg-surface-hover"
                        >
                          مراجعه نکرد
                        </button>
                      ) : null}
                      {canCancel ? (
                        <button
                          type="button"
                          onClick={() => setCancelId(item.numericId)}
                          className="px-4 py-3 text-right text-sm font-semibold text-error hover:bg-surface-hover"
                        >
                          لغو نوبت
                        </button>
                      ) : null}
                    </div>
                  ) : null}

                  {status === AppointmentStatus.Scheduled || status === AppointmentStatus.CheckedIn ? (
                    <div className="flex flex-col gap-2">
                      {status === AppointmentStatus.Scheduled ? (
                        <Button
                          type="button"
                          className="w-full rounded-[12px]"
                          disabled={busy}
                          isLoading={lifecycle.checkIn.isPending}
                          onClick={() =>
                            void run(
                              () => lifecycle.checkIn.mutateAsync(item.numericId),
                              "ورود مشتری ثبت شد.",
                              "ثبت ورود ناموفق بود."
                            )
                          }
                        >
                          مشتری رسید
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          className="w-full rounded-[12px]"
                          disabled={busy}
                          isLoading={lifecycle.complete.isPending}
                          onClick={() =>
                            void run(
                              () => lifecycle.complete.mutateAsync(item.numericId),
                              "نوبت انجام شد.",
                              "ثبت انجام نوبت ناموفق بود."
                            )
                          }
                        >
                          انجام شد
                        </Button>
                      )}
                      <div className="flex gap-2">
                        {canReschedule ? (
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(dashboardQuietButtonClass, "flex-1 rounded-[12px]")}
                            onClick={() => setStep("reschedule")}
                          >
                            جابه‌جایی
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          variant="outline"
                          aria-label="کارهای بیشتر"
                          aria-expanded={moreOpen}
                          className={cn(dashboardQuietButtonClass, "rounded-[12px]", !canReschedule && "flex-1")}
                          onClick={() => setMoreOpen((v) => !v)}
                        >
                          <DotsThreeIcon size={20} weight="bold" />
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ) : null}
        </DrawerContent>
      </Drawer>

      <CancelAppointmentDialog
        appointmentId={cancelId}
        subject={subject}
        onClose={() => setCancelId(null)}
        isPending={lifecycle.cancel.isPending}
        onConfirm={async (reason, notifyCustomer) => {
          if (cancelId == null) return;
          await run(
            () => lifecycle.cancel.mutateAsync({ id: cancelId, reason, notifyCustomer }),
            "نوبت لغو شد.",
            "لغو نوبت ناموفق بود."
          );
          setCancelId(null);
          setMoreOpen(false);
        }}
      />
      <NoShowDialog
        appointmentId={noShowId}
        subject={subject}
        onClose={() => setNoShowId(null)}
        isPending={lifecycle.noShow.isPending}
        onConfirm={async (notifyCustomer) => {
          if (noShowId == null) return;
          await run(
            () => lifecycle.noShow.mutateAsync({ id: noShowId, notifyCustomer }),
            "«مراجعه نکرد» ثبت شد.",
            "ثبت ناموفق بود."
          );
          setNoShowId(null);
          setMoreOpen(false);
        }}
      />
    </>
  );
}
