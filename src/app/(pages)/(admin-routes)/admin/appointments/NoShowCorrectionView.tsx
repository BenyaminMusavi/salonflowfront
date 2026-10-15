"use client";

import { useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Input } from "@/shared/components/primitives/input/Input";
import { Button } from "@/shared/components/primitives/button/Button";
import {
  useMutateAdminRevertNoShow,
  useQueryAdminNoShowReview,
} from "@/services/domains/admin/hooks/useAdminNoShowCorrection";
import {
  buildRevertNoShowPayload,
  needsExplicitLines,
  parseAppointmentPublicId,
  resolutionLabel,
  selectableLines,
} from "@/services/domains/admin/utils/noShowReview";
import {
  UNDO_NO_SHOW_REASON_MAX,
  getUndoNoShowErrorMessage,
} from "@/services/domains/appointments/utils/undoNoShow";
import { formatAppointmentDateTime } from "@/services/domains/appointments/utils/appointment-display";
import { formatToman } from "@/shared/utils/salonDisplay";
import { APP_LOCALE } from "@/shared/utils/locale";
import { cn } from "@/shared/utils/className";
import { AppointmentStatus } from "@/services/common/enums/domain-enums";

const lineStatusLabel = (status: number) =>
  status === 4 ? "لغو شده" : status === 3 ? "انجام شده" : status === 2 ? "در حال انجام" : "رزرو شده";

/**
 * Support tool: correct a mistaken «مراجعه نکرد» (the owner's own 24h window is gone, or the row is
 * legacy). Everything shown comes from `no-show-review`; for legacy rows the admin picks the services to
 * reopen explicitly — nothing is pre-selected.
 */
export default function NoShowCorrectionView() {
  const [input, setInput] = useState("");
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const submitting = useRef(false);

  const reviewQuery = useQueryAdminNoShowReview(appointmentId);
  const revert = useMutateAdminRevertNoShow();
  const review = reviewQuery.data?.data;

  const lookup = () => {
    const id = parseAppointmentPublicId(input);
    if (!id) {
      setInputError("شناسهٔ نوبت معتبر نیست (یک Guid مثل 3f2a… لازم است).");
      return;
    }
    setInputError(null);
    setSelected([]);
    setReason("");
    setFormError(null);
    setDone(false);
    setAppointmentId(id);
    if (id === appointmentId) void reviewQuery.refetch();
  };

  const toggle = (id: string) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const submit = async () => {
    if (!review || !appointmentId || revert.isPending || submitting.current) return;
    const built = buildRevertNoShowPayload(review, selected, reason);
    if (!built.ok) {
      setFormError(built.error);
      return;
    }
    submitting.current = true;
    setFormError(null);
    try {
      await revert.mutateAsync({ appointmentPublicId: appointmentId, data: built.payload });
      setDone(true);
      setAppointmentId(null);
    } catch (err) {
      setFormError(getUndoNoShowErrorMessage(err));
      void reviewQuery.refetch();
    } finally {
      submitting.current = false;
    }
  };

  const explicit = review ? needsExplicitLines(review) : false;
  const lines = review?.lines ?? [];
  const canRevert = !!review && review.resolution !== "notNoShow" && Number(review.status) === AppointmentStatus.NoShow;
  const reasonLength = reason.trim().length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-lg font-bold text-foreground">اصلاح «مراجعه نکرد»</h1>
        <p className="mt-1 text-xs text-foreground-muted">
          برای نوبت‌هایی که مهلت اصلاح صاحب سالن گذشته یا از قبل ثبت شده‌اند. شناسهٔ نوبت را وارد کنید تا وضعیت واقعی آن از سرور نمایش داده شود.
        </p>
      </div>

      <form
        className="flex flex-wrap items-start gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          lookup();
        }}
      >
        <div className="max-w-md flex-1">
          <Input
            startIcon={<MagnifyingGlassIcon size={18} />}
            placeholder="شناسهٔ نوبت (Guid)"
            value={input}
            dir="ltr"
            onChange={(e) => setInput(e.target.value)}
            aria-invalid={!!inputError}
          />
          {inputError ? <p className="mt-1 text-xs text-error">{inputError}</p> : null}
        </div>
        <Button type="submit" isLoading={reviewQuery.isFetching}>
          بررسی
        </Button>
      </form>

      {done ? (
        <p role="status" className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground">
          «مراجعه نکرد» اصلاح شد و نوبت دوباره باز است.
        </p>
      ) : null}

      {reviewQuery.isError ? (
        <p role="alert" className="rounded-xl border border-error-border bg-error-background px-4 py-3 text-xs font-medium text-error">
          {getUndoNoShowErrorMessage(reviewQuery.error, "دریافت اطلاعات نوبت ناموفق بود.")}
        </p>
      ) : null}

      {review ? (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
          <div className="flex flex-col gap-1 text-sm">
            <p className="font-bold text-foreground">{resolutionLabel(review.resolution)}</p>
            <p className="text-xs text-foreground-muted">زمان نوبت: {formatAppointmentDateTime(review.startTime)}</p>
            {review.noShowRecordedAt ? (
              <p className="text-xs text-foreground-muted">
                ثبت «مراجعه نکرد»: {formatAppointmentDateTime(review.noShowRecordedAt)}
              </p>
            ) : null}
          </div>

          {review.cancelledLinesOverlap ? (
            <p role="alert" className="rounded-xl bg-error-background px-3 py-2 text-xs leading-5 text-error">
              چند خدمتِ لغوشده هم‌زمان هم‌پوشانی دارند؛ نوبت بیش از یک بار ویرایش شده و انتخاب خدمت‌ها مبهم است. با دقت انتخاب کنید.
            </p>
          ) : null}

          {lines.length === 0 ? (
            <p className="text-sm text-foreground-muted">این نوبت خدمتی ندارد که بتوان آن را بازگرداند.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {lines.map((line) => {
                const pickable = explicit && selectableLines(review).some((l) => l.servicePublicId === line.servicePublicId);
                return (
                  <li key={line.servicePublicId} className="flex items-start gap-3 text-sm">
                    {explicit ? (
                      <input
                        type="checkbox"
                        id={`line-${line.servicePublicId}`}
                        className="mt-1 size-4"
                        disabled={!pickable || revert.isPending}
                        checked={selected.includes(line.servicePublicId)}
                        onChange={() => toggle(line.servicePublicId)}
                      />
                    ) : null}
                    <label htmlFor={`line-${line.servicePublicId}`} className="flex flex-1 flex-col gap-0.5">
                      <span className="text-foreground">
                        {formatAppointmentDateTime(line.startTime)} · {line.durationMinutes.toLocaleString(APP_LOCALE)} دقیقه ·{" "}
                        {formatToman(line.price)} تومان
                      </span>
                      <span className="text-xs text-foreground-muted">
                        {lineStatusLabel(Number(line.status))}
                        {!explicit && line.reopensAutomatically ? " · با اصلاح دوباره باز می‌شود" : ""}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}

          {review.depositPayments.length > 0 ? (
            <div className="flex flex-col gap-1 text-xs text-foreground-muted">
              <p className="font-bold text-foreground">بیعانه‌ها</p>
              {review.depositPayments.map((p) => (
                <p key={p.paymentPublicId}>
                  پرداخت {formatToman(p.amount)} تومان · ضبط‌شده {formatToman(p.forfeited)} · بازگشتی {formatToman(p.refunded)} · نزد سالن{" "}
                  {formatToman(p.held)}
                </p>
              ))}
            </div>
          ) : null}

          {canRevert ? (
            <div className="flex flex-col gap-2">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-foreground-muted">علت اصلاح</span>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  disabled={revert.isPending}
                  className="w-full rounded-[12px] border border-input-border bg-input p-3 text-sm text-foreground focus:outline-none"
                />
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    reasonLength > UNDO_NO_SHOW_REASON_MAX ? "text-error" : "text-foreground-muted"
                  )}
                  dir="ltr"
                >
                  {reasonLength.toLocaleString(APP_LOCALE)} / {UNDO_NO_SHOW_REASON_MAX.toLocaleString(APP_LOCALE)}
                </span>
              </label>
              {formError ? (
                <p role="alert" className="rounded-xl bg-error-background px-3 py-2 text-xs text-error">
                  {formError}
                </p>
              ) : null}
              <div>
                <Button type="button" onClick={submit} isLoading={revert.isPending}>
                  اصلاح و بازکردن نوبت
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-foreground-muted">برای این نوبت اصلاحی قابل انجام نیست.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
