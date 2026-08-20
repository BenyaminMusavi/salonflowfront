"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BottomSheet from "@/shared/components/composites/bottom-sheet/BottomSheet";
import { useMutateCreateSalonReport } from "@/services/domains/salon-reports/hooks/useMutateCreateSalonReport";
import { SalonReportReason } from "@/services/common/enums/domain-enums";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { getLoginHref } from "@/shared/utils/authRedirect";
import { cn } from "@/shared/utils/className";

const REASONS: { value: SalonReportReason; label: string }[] = [
  { value: SalonReportReason.Misconduct, label: "سوءرفتار" },
  { value: SalonReportReason.Scam, label: "کلاهبرداری" },
  { value: SalonReportReason.Inappropriate, label: "محتوای نامناسب" },
  { value: SalonReportReason.Other, label: "سایر" },
];

interface ReportSalonSheetProps {
  open: boolean;
  onClose: () => void;
  salonId: number;
  appointmentId?: number;
}

export default function ReportSalonSheet({
  open,
  onClose,
  salonId,
  appointmentId,
}: ReportSalonSheetProps) {
  const router = useRouter();
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const { mutateAsync, isPending } = useMutateCreateSalonReport();

  const [reason, setReason] = useState<SalonReportReason>(
    SalonReportReason.Misconduct
  );
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const reset = () => {
    setReason(SalonReportReason.Misconduct);
    setDescription("");
    setError("");
    setDone(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    setError("");
    if (!isLoggedIn) {
      router.push(getLoginHref(window.location.pathname));
      return;
    }
    try {
      await mutateAsync({
        salonId,
        reason,
        description: description.trim() || null,
        appointmentId: appointmentId ?? null,
      });
      setDone(true);
    } catch (e) {
      setError(
        getApiErrorMessage(
          e,
          "ثبت گزارش ناموفق بود. باید حداقل یک نوبت تکمیل‌شده در این سالن داشته باشید."
        )
      );
    }
  };

  return (
    <BottomSheet open={open} onClose={handleClose}>
      <div className="flex flex-col gap-4 pb-4">
        <h3 className="text-base font-bold text-foreground">گزارش سالن</h3>
        <p className="text-xs text-foreground-muted">
          گزارش‌ها توسط تیم پلتفرم بررسی می‌شوند. نیاز به حداقل یک نوبت
          تکمیل‌شده در این سالن دارید.
        </p>

        {done ? (
          <div className="rounded-2xl bg-primary/10 p-4 text-sm text-foreground">
            گزارش شما ثبت شد و در صف بررسی قرار گرفت.
            <button
              type="button"
              onClick={handleClose}
              className="mt-4 block w-full rounded-full bg-primary py-3 text-center text-sm font-bold text-primary-foreground"
            >
              بستن
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-foreground-muted">دلیل</span>
              <div className="grid grid-cols-2 gap-2">
                {REASONS.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setReason(r.value)}
                    className={cn(
                      "rounded-2xl px-3 py-3 text-sm font-medium transition",
                      reason === r.value
                        ? "bg-primary/15 ring-1 ring-primary text-foreground"
                        : "bg-background-secondary text-foreground-muted"
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex flex-col gap-2 text-sm">
              <span className="text-foreground-muted">توضیحات (اختیاری)</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="rounded-2xl bg-background-secondary px-4 py-3 text-foreground outline-none"
                placeholder="جزئیات بیشتر…"
              />
            </label>

            {error && (
              <p className="rounded-2xl bg-error/10 px-3 py-2 text-xs text-error">
                {error}
              </p>
            )}

            <button
              type="button"
              disabled={isPending}
              onClick={handleSubmit}
              className="rounded-full bg-error py-3 text-sm font-bold text-white disabled:opacity-40"
            >
              {isPending ? "در حال ارسال…" : "ارسال گزارش"}
            </button>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
