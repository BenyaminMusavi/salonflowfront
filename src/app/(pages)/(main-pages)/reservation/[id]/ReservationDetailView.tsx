"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import TopNavigation from "@/shared/components/composites/layout/top-navigation/TopNavigation";
import { useQueryMyAppointmentById } from "@/services/domains/appointments/hooks/useQueryMyAppointmentById";
import { useMutateCancelAppointment } from "@/services/domains/appointments/hooks/useMutateCancelAppointment";
import {
  appointmentStatusClass,
  appointmentStatusLabel,
  canCustomerCancel,
  formatAppointmentDateTime,
  isWithinFreeCancellationWindow,
} from "@/services/domains/appointments/utils/appointment-display";
import { formatToman } from "@/shared/utils/salonDisplay";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { RouteAddress } from "@/shared/data/routeAddress";
import { cn } from "@/shared/utils/className";
import { getLoginHref } from "@/shared/utils/authRedirect";
import AppointmentReviewSection from "./components/AppointmentReviewSection";
import { AppointmentStatus } from "@/services/common/enums/domain-enums";

export default function ReservationDetailView() {
  const params = useParams<{ id: string }>();
  const appointmentPublicId = params?.id;
  const router = useRouter();
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);

  const { data, isLoading, isError } = useQueryMyAppointmentById(
    appointmentPublicId
  );
  const { mutateAsync: cancel, isPending: isCancelling } =
    useMutateCancelAppointment();

  const [reason, setReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [error, setError] = useState("");
  const [cancelled, setCancelled] = useState(false);

  const appointment = data?.data;

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col gap-4 px-safe-area pb-24 pt-4">
        <TopNavigation>جزئیات نوبت</TopNavigation>
        <p className="text-sm text-foreground-muted">برای مشاهده وارد شوید.</p>
        <button
          type="button"
          onClick={() => {
            router.push(
              getLoginHref(
                appointmentPublicId
                  ? RouteAddress.RESERVATION.DETAILS(appointmentPublicId)
                  : RouteAddress.RESERVATION.BASE
              )
            );
          }}
          className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          ورود
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 px-safe-area pb-24 pt-4">
        <TopNavigation>جزئیات نوبت</TopNavigation>
        <p className="text-sm text-foreground-muted">در حال بارگذاری…</p>
      </div>
    );
  }

  if (isError || !appointment) {
    return (
      <div className="flex flex-col gap-4 px-safe-area pb-24 pt-4">
        <TopNavigation>جزئیات نوبت</TopNavigation>
        <p className="text-sm text-error">نوبت یافت نشد.</p>
        <Link href={RouteAddress.RESERVATION.BASE} className="text-sm text-primary">
          بازگشت به لیست
        </Link>
      </div>
    );
  }

  const status = cancelled ? 3 : appointment.status;
  const freeCancel = isWithinFreeCancellationWindow(appointment.startTime);
  const canCancel = canCustomerCancel(appointment.status) && !cancelled;

  const handleCancel = async () => {
    setError("");
    const trimmed = reason.trim() || "تغییر برنامه";
    try {
      await cancel({ id: appointment.id, reason: trimmed });
      setCancelled(true);
      setShowCancelForm(false);
    } catch (e) {
      setError(getApiErrorMessage(e, "لغو نوبت ناموفق بود."));
    }
  };

  return (
    <div className="flex flex-col gap-4 px-safe-area pb-28 pt-4">
      <TopNavigation>جزئیات نوبت</TopNavigation>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {appointment.salonName}
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">
            {formatAppointmentDateTime(appointment.startTime)}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-semibold",
            appointmentStatusClass(status)
          )}
        >
          {appointmentStatusLabel(status)}
        </span>
      </div>

      {(appointment.branchName || appointment.branchAddress) && (
        <div className="rounded-[20px] bg-surface-tertiary p-4 text-sm">
          {appointment.branchName && (
            <p className="font-bold text-foreground">{appointment.branchName}</p>
          )}
          {appointment.branchAddress && (
            <p className="mt-1 text-foreground-muted">
              {appointment.branchAddress}
            </p>
          )}
        </div>
      )}

      <div className="rounded-[20px] bg-surface-tertiary p-4">
        <p className="mb-3 text-sm font-bold text-foreground">خدمات</p>
        <ul className="flex flex-col gap-3">
          {appointment.services?.map((svc) => (
            <li
              key={`${svc.offeringPublicId}-${svc.staffPublicId}`}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <div>
                <p className="font-medium text-foreground">{svc.name}</p>
                <p className="text-xs text-foreground-muted">
                  {svc.durationMinutes} دقیقه
                  {svc.staffName ? ` · ${svc.staffName}` : ""}
                </p>
              </div>
              <span className="shrink-0 font-bold text-foreground">
                {formatToman(svc.price)}
              </span>
            </li>
          ))}
        </ul>
        <div className="my-3 h-px bg-border" />
        <div className="flex justify-between text-sm">
          <span className="text-foreground-muted">
            جمع ({appointment.totalDurationMinutes} دقیقه)
          </span>
          <span className="font-bold text-foreground">
            {formatToman(appointment.totalPrice)} تومان
          </span>
        </div>
      </div>

      {(status === AppointmentStatus.Completed ||
        appointment.status === AppointmentStatus.Completed) &&
        !cancelled && (
          <AppointmentReviewSection
            appointmentId={appointment.id}
            status={AppointmentStatus.Completed}
          />
        )}

      {error && (
        <p className="rounded-2xl bg-error/10 px-4 py-3 text-xs text-error">
          {error}
        </p>
      )}

      {cancelled && (
        <p className="rounded-2xl bg-foreground/5 px-4 py-3 text-sm text-foreground-muted">
          نوبت لغو شد.
        </p>
      )}

      {canCancel && !showCancelForm && (
        <div className="flex flex-col gap-2">
          {!freeCancel && (
            <p className="text-xs text-orange-400">
              کمتر از ۲۴ ساعت تا نوبت مانده؛ لغو ممکن است شامل جریمه بیعانه شود.
            </p>
          )}
          {freeCancel && (
            <p className="text-xs text-foreground-muted">
              لغو در پنجره رایگان (≥ ۲۴ ساعت) معمولاً بیعانه را به کیف پول
              برمی‌گرداند.
            </p>
          )}
          <button
            type="button"
            onClick={() => setShowCancelForm(true)}
            className="rounded-full bg-surface-tertiary py-3 text-sm font-bold text-error"
          >
            لغو نوبت
          </button>
        </div>
      )}

      {canCancel && showCancelForm && (
        <div className="flex flex-col gap-3 rounded-[20px] bg-surface-tertiary p-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-foreground-muted">دلیل لغو</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="مثلاً تغییر برنامه"
              className="rounded-2xl bg-background-secondary px-4 py-3 text-foreground outline-none"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowCancelForm(false)}
              className="flex-1 rounded-full bg-background-secondary py-3 text-sm font-bold"
            >
              انصراف
            </button>
            <button
              type="button"
              disabled={isCancelling}
              onClick={handleCancel}
              className="flex-1 rounded-full bg-error py-3 text-sm font-bold text-white disabled:opacity-40"
            >
              {isCancelling ? "در حال لغو…" : "تأیید لغو"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
