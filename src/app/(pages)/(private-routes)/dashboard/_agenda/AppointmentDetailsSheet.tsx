"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CaretDownIcon,
  ChatCircleTextIcon,
  DotsThreeIcon,
  PhoneIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/shared/components/primitives/drawer/Drawer";
import { Button } from "@/shared/components/primitives/button/Button";
import { AppointmentStatus } from "@/services/common/enums/domain-enums";
import type { IAgendaItem, ISalonAppointmentDetails } from "@/services/domains/appointments/types/appointments.type";
import {
  useMutateSalonAppointment,
  useQuerySalonAppointmentDetails,
} from "@/services/domains/appointments/hooks";
import { appointmentStatusLabel } from "@/services/domains/appointments/utils/appointment-display";
import { useQueryCapabilities } from "@/services/domains/auth/hooks/useQueryCapabilities";
import { useCustomerPreviewStore } from "@/services/domains/customers/store/useCustomerPreviewStore";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { RouteAddress } from "@/shared/data/routeAddress";
import { useMediaQuery } from "@/shared/hooks";
import { formatToman } from "@/shared/utils/salonDisplay";
import { formatSalonDate, formatSalonDateTime, utcToSalonYmd } from "@/shared/utils/salonTime";
import { APP_LOCALE } from "@/shared/utils/locale";
import { cn } from "@/shared/utils/className";
import CancelAppointmentDialog from "../CancelAppointmentDialog";
import NoShowDialog from "../NoShowDialog";
import type { DashboardToastState } from "../_components/DashboardToast";
import { dashboardQuietButtonClass } from "../_components/buttonClasses";
import { panelSheetClass } from "../_components/panelSheet";
import { StatusMark, formatClock } from "./AgendaRow";
import { durationMinutes } from "./agendaUtils";
import { dayLabel } from "./DayTimePicker";
import { CheckoutStep } from "./CheckoutStep";
import { RescheduleStep } from "./RescheduleStep";

type Step = "details" | "reschedule" | "checkout" | "complete-checkout";

const roundAction =
  "flex h-10 flex-1 items-center justify-center gap-1.5 rounded-[12px] bg-surface-hover text-sm font-semibold text-foreground";

/** Customer line, contact buttons and visit history. */
function CustomerBlock({
  details,
  item,
  canSeePhone,
}: {
  details: ISalonAppointmentDetails | null;
  item: IAgendaItem;
  canSeePhone: boolean;
}) {
  const remember = useCustomerPreviewStore((s) => s.remember);
  const c = details?.customer;
  const name = c?.fullName || item.customerName || "مشتری";
  const phone = canSeePhone ? c?.phone ?? item.customerPhone : null;
  const publicId = c?.publicId ?? item.customerPublicId;
  const stats = c
    ? [
        c.visitsCount ? `${c.visitsCount.toLocaleString(APP_LOCALE)} مراجعه` : "مشتری جدید",
        c.lastVisitAt ? `آخرین بار ${formatSalonDate(c.lastVisitAt, { day: "numeric", month: "long" })}` : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  const nameNode = <span className="block truncate text-base font-bold text-foreground">{name}</span>;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-brand text-base font-bold text-content-brand">
          {name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          {publicId ? (
            <Link
              href={RouteAddress.DASHBOARD.CUSTOMER_APPOINTMENTS(publicId)}
              onClick={() => remember({ publicId, fullName: name, phone: phone ?? "" })}
              className="hover:underline"
            >
              {nameNode}
            </Link>
          ) : (
            nameNode
          )}
          {stats ? <span className="block text-xs text-foreground-muted">{stats}</span> : null}
        </div>
      </div>
      {c && c.noShowCount > 0 ? (
        <p className="flex items-center gap-1.5 text-xs text-warning">
          <WarningCircleIcon size={14} weight="bold" />
          {c.noShowCount.toLocaleString(APP_LOCALE)} بار مراجعه نکرده
        </p>
      ) : null}
      {phone ? (
        <div className="flex items-center gap-2">
          <a href={`tel:${phone}`} className={roundAction}>
            <PhoneIcon size={16} />
            تماس
          </a>
          <a href={`sms:${phone}`} className={roundAction}>
            <ChatCircleTextIcon size={16} />
            پیامک
          </a>
          <span className="px-1 text-xs text-foreground-muted" dir="ltr">
            {phone}
          </span>
        </div>
      ) : null}
    </div>
  );
}

/** Internal salon note on this appointment — the customer never sees it. */
function InternalNote({ details, onToast }: { details: ISalonAppointmentDetails; onToast: (t: DashboardToastState) => void }) {
  const mutate = useMutateSalonAppointment();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(details.internalNote ?? "");
  useEffect(() => setText(details.internalNote ?? ""), [details.internalNote]);

  const save = async () => {
    try {
      await mutate.internalNote.mutateAsync({ publicId: details.publicId, note: text.trim() || null });
      setEditing(false);
    } catch (err) {
      onToast({ type: "error", message: getApiErrorMessage(err, "ذخیره‌ی یادداشت ناموفق بود.") });
    }
  };

  if (!editing) {
    return (
      <button type="button" onClick={() => setEditing(true)} className="flex flex-col items-start gap-0.5 px-4 py-3 text-right">
        <span className="text-xs text-foreground-muted">یادداشت سالن (مشتری نمی‌بیند)</span>
        <span className={cn("text-sm", details.internalNote ? "text-foreground" : "text-primary")}>
          {details.internalNote || "＋ افزودن یادداشت"}
        </span>
      </button>
    );
  }
  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        autoFocus
        className="w-full rounded-[12px] border border-input-border bg-input p-3 text-sm text-foreground focus:outline-none"
        placeholder="مثلاً: حساسیت به رنگ آمونیاک‌دار"
      />
      <div className="flex gap-2">
        <Button type="button" size="sm" className="rounded-[12px]" isLoading={mutate.internalNote.isPending} onClick={() => void save()}>
          ذخیره
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            setText(details.internalNote ?? "");
            setEditing(false);
          }}
        >
          انصراف
        </Button>
      </div>
    </div>
  );
}

/**
 * Appointment details — bottom sheet on mobile, side panel on desktop. Everything comes from
 * `salon-details`; buttons follow the server's `allowedActions` (one primary action per status),
 * reschedule and checkout are steps in the same sheet, cancel / no-show confirm, check-in and
 * complete offer a 5-minute undo.
 */
export function AppointmentDetailsSheet({
  item,
  showBranch,
  onClose,
  onToast,
}: {
  item: IAgendaItem | null;
  /** Kept for callers; what the user may do now comes from capabilities / allowedActions. */
  isStaff?: boolean;
  showBranch: boolean;
  onClose: () => void;
  onToast: (t: DashboardToastState) => void;
}) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { capabilities } = useQueryCapabilities();
  const detailsQuery = useQuerySalonAppointmentDetails(item?.publicId);
  const details = detailsQuery.data?.data ?? null;
  const mutate = useMutateSalonAppointment();
  const [step, setStep] = useState<Step>("details");
  const [moreOpen, setMoreOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [noShowOpen, setNoShowOpen] = useState(false);

  const itemKey = item?.publicId;
  useEffect(() => {
    setStep("details");
    setMoreOpen(false);
    setHistoryOpen(false);
  }, [itemKey]);

  const status = Number(details?.status ?? item?.status);
  const allowed = new Set<string>(details?.allowedActions ?? []);
  const can = (a: string) => allowed.has(a);
  const busy = mutate.checkIn.isPending || mutate.complete.isPending || mutate.undo.isPending;
  const canSeePhone = capabilities?.canSeeCustomerPhone ?? true;
  const money = details?.money;
  const showMoney = !!money && !!(capabilities?.canCollectPayment || capabilities?.canViewFinance);
  const subject = item
    ? `${item.customerName || "مشتری"} · ${dayLabel(utcToSalonYmd(item.startTime))} ${formatClock(item.startTime)}`
    : undefined;

  const undoAction = (publicId: string) => ({
    label: "بازگردانی",
    onClick: () =>
      mutate.undo.mutate(publicId, {
        onSuccess: () => onToast({ type: "success", message: "بازگردانده شد." }),
        onError: (err) => onToast({ type: "error", message: getApiErrorMessage(err, "بازگردانی ممکن نشد.") }),
      }),
  });

  const checkIn = async () => {
    if (!item?.publicId) return;
    try {
      await mutate.checkIn.mutateAsync(item.publicId);
      onToast({ type: "success", message: "ورود مشتری ثبت شد.", action: undoAction(item.publicId) });
    } catch (err) {
      onToast({ type: "error", message: getApiErrorMessage(err, "ثبت ورود ناموفق بود.") });
    }
  };

  const completeOnly = async () => {
    if (!item?.publicId) return;
    try {
      await mutate.complete.mutateAsync(item.publicId);
      setMoreOpen(false);
      onToast({ type: "success", message: "نوبت انجام شد.", action: undoAction(item.publicId) });
    } catch (err) {
      onToast({ type: "error", message: getApiErrorMessage(err, "ثبت انجام نوبت ناموفق بود.") });
    }
  };

  const paymentLabel =
    money?.paymentStatus === "paid"
      ? "پرداخت شد"
      : money?.paymentStatus === "partial"
        ? `بخشی پرداخت شده · مانده ${formatToman(money.outstanding)} تومان`
        : null;

  return (
    <>
      <Drawer
        open={!!item}
        onOpenChange={(open) => !open && onClose()}
        direction={isDesktop ? "left" : "bottom"}
        repositionInputs={false}
      >
        <DrawerContent className={cn("border-border bg-background", panelSheetClass(isDesktop))}>
          {item ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-safe-area pb-6 pt-2 lg:px-6 lg:pt-6">
              <DrawerTitle className="sr-only">جزئیات نوبت</DrawerTitle>
              <DrawerDescription className="sr-only">{subject}</DrawerDescription>
              {details && step === "reschedule" ? (
                <RescheduleStep details={details} onBack={() => setStep("details")} onDone={() => setStep("details")} onToast={onToast} />
              ) : details && (step === "checkout" || step === "complete-checkout") ? (
                <CheckoutStep
                  details={details}
                  completeFirst={step === "complete-checkout"}
                  canDiscount={!!capabilities?.canViewFinance}
                  onBack={() => setStep("details")}
                  onDone={() => setStep("details")}
                  onToast={onToast}
                />
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <StatusMark status={status} />
                      <p className="mt-1 text-base font-bold text-foreground">{dayLabel(utcToSalonYmd(item.startTime))}</p>
                      <p className="text-sm tabular-nums text-foreground-muted">
                        {formatClock(item.startTime)} تا {formatClock(item.endTime)} · {durationMinutes(item)} دقیقه
                      </p>
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

                  <CustomerBlock details={details} item={item} canSeePhone={canSeePhone} />

                  <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
                    {(details?.services ?? item.services).map((s, i) => (
                      <div key={`${s.name}-${i}`} className="flex items-start justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">{s.name}</p>
                          <p className="text-xs text-foreground-muted">
                            {[s.staffName, `${s.durationMinutes} دقیقه`].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm tabular-nums text-foreground">{formatToman(s.price)}</p>
                      </div>
                    ))}
                    {showBranch && (details?.branch?.name || item.branchName) ? (
                      <div className="px-4 py-3 text-xs text-foreground-muted">
                        شعبه {details?.branch?.name || item.branchName}
                        {details?.branch?.address ? ` · ${details.branch.address}` : ""}
                      </div>
                    ) : null}
                    {showMoney && money ? (
                      <div className="flex flex-col gap-1 px-4 py-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-foreground-muted">جمع</span>
                          <span className="font-bold tabular-nums text-foreground">{formatToman(money.total)} تومان</span>
                        </div>
                        {money.deposit > 0 ? (
                          <div className="flex justify-between text-xs text-foreground-muted">
                            <span>بیعانه</span>
                            <span className="tabular-nums">{formatToman(money.deposit)} تومان</span>
                          </div>
                        ) : null}
                        {money.discount > 0 ? (
                          <div className="flex justify-between text-xs text-foreground-muted">
                            <span>تخفیف</span>
                            <span className="tabular-nums">{formatToman(money.discount)} تومان</span>
                          </div>
                        ) : null}
                        {paymentLabel ? (
                          <p className={cn("text-xs font-semibold", money.paymentStatus === "paid" ? "text-success" : "text-warning")}>
                            {paymentLabel}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  {details ? (
                    <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
                      {details.customerNote ? (
                        <div className="flex flex-col gap-0.5 px-4 py-3">
                          <span className="text-xs text-foreground-muted">یادداشت مشتری</span>
                          <span className="text-sm text-foreground">{details.customerNote}</span>
                        </div>
                      ) : null}
                      {details.customer?.note ? (
                        <div className="flex flex-col gap-0.5 px-4 py-3">
                          <span className="text-xs text-foreground-muted">درباره‌ی این مشتری</span>
                          <span className="text-sm text-foreground">{details.customer.note}</span>
                        </div>
                      ) : null}
                      <InternalNote details={details} onToast={onToast} />
                    </div>
                  ) : detailsQuery.isLoading ? (
                    <div className="h-16 animate-pulse rounded-[16px] bg-background-secondary" />
                  ) : null}

                  {details?.statusHistory?.length ? (
                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => setHistoryOpen((v) => !v)}
                        className="flex items-center gap-1 self-start px-1 text-xs font-semibold text-foreground-muted"
                      >
                        تاریخچه‌ی نوبت
                        <CaretDownIcon size={12} className={cn("transition-transform", historyOpen && "rotate-180")} />
                      </button>
                      {historyOpen ? (
                        <ol className="mt-2 flex flex-col gap-1.5 px-1 text-xs text-foreground-muted">
                          {details.statusHistory.map((h, i) => (
                            <li key={i}>
                              {appointmentStatusLabel(Number(h.status))} ·{" "}
                              {formatSalonDateTime(h.at, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                              {h.byName ? ` · ${h.byName}` : ""}
                              {h.reason ? ` · ${h.reason}` : ""}
                            </li>
                          ))}
                        </ol>
                      ) : null}
                    </div>
                  ) : null}

                  {moreOpen ? (
                    <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[16px] bg-background-secondary">
                      {can("noShow") ? (
                        <button type="button" onClick={() => setNoShowOpen(true)} className="px-4 py-3 text-right text-sm font-semibold text-foreground hover:bg-surface-hover">
                          مراجعه نکرد
                        </button>
                      ) : null}
                      {status === AppointmentStatus.CheckedIn && can("complete") && can("collectPayment") ? (
                        <button type="button" onClick={() => void completeOnly()} className="px-4 py-3 text-right text-sm font-semibold text-foreground hover:bg-surface-hover">
                          انجام شد، بدون دریافت پرداخت
                        </button>
                      ) : null}
                      {can("cancel") ? (
                        <button type="button" onClick={() => setCancelOpen(true)} className="px-4 py-3 text-right text-sm font-semibold text-error hover:bg-surface-hover">
                          لغو نوبت
                        </button>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-2">
                    {can("checkIn") ? (
                      <Button type="button" className="w-full rounded-[12px]" disabled={busy || !details} isLoading={mutate.checkIn.isPending} onClick={() => void checkIn()}>
                        مشتری رسید
                      </Button>
                    ) : can("complete") ? (
                      can("collectPayment") ? (
                        <Button type="button" className="w-full rounded-[12px]" disabled={busy || !details} onClick={() => setStep("complete-checkout")}>
                          انجام شد و دریافت{money ? ` ${formatToman(money.outstanding)} تومان` : ""}
                        </Button>
                      ) : (
                        <Button type="button" className="w-full rounded-[12px]" disabled={busy || !details} isLoading={mutate.complete.isPending} onClick={() => void completeOnly()}>
                          انجام شد
                        </Button>
                      )
                    ) : can("collectPayment") && money && money.outstanding > 0 ? (
                      <Button type="button" className="w-full rounded-[12px]" onClick={() => setStep("checkout")}>
                        دریافت {formatToman(money.outstanding)} تومان
                      </Button>
                    ) : null}

                    {can("reschedule") || can("noShow") || can("cancel") ? (
                      <div className="flex gap-2">
                        {can("reschedule") ? (
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(dashboardQuietButtonClass, "flex-1 rounded-[12px]")}
                            disabled={!details}
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
                          className={cn(dashboardQuietButtonClass, "rounded-[12px]", !can("reschedule") && "flex-1")}
                          onClick={() => setMoreOpen((v) => !v)}
                        >
                          <DotsThreeIcon size={20} weight="bold" />
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DrawerContent>
      </Drawer>

      <CancelAppointmentDialog
        appointmentId={cancelOpen ? item?.numericId ?? 0 : null}
        subject={subject}
        onClose={() => setCancelOpen(false)}
        isPending={mutate.cancel.isPending}
        onConfirm={async (reason, notifyCustomer) => {
          if (!item?.publicId) return;
          try {
            await mutate.cancel.mutateAsync({ publicId: item.publicId, reason, notifyCustomer });
            onToast({ type: "success", message: "نوبت لغو شد." });
          } catch (err) {
            onToast({ type: "error", message: getApiErrorMessage(err, "لغو نوبت ناموفق بود.") });
          }
          setCancelOpen(false);
          setMoreOpen(false);
        }}
      />
      <NoShowDialog
        appointmentId={noShowOpen ? item?.numericId ?? 0 : null}
        subject={subject}
        onClose={() => setNoShowOpen(false)}
        isPending={mutate.noShow.isPending}
        onConfirm={async (notifyCustomer) => {
          if (!item?.publicId) return;
          try {
            await mutate.noShow.mutateAsync({ publicId: item.publicId, notifyCustomer });
            onToast({ type: "success", message: "«مراجعه نکرد» ثبت شد." });
          } catch (err) {
            onToast({ type: "error", message: getApiErrorMessage(err, "ثبت ناموفق بود.") });
          }
          setNoShowOpen(false);
          setMoreOpen(false);
        }}
      />
    </>
  );
}
