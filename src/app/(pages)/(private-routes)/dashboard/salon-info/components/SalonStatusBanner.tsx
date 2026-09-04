"use client";

import Link from "next/link";
import { RouteAddress } from "@/shared/data/routeAddress";
import { SalonApprovalStatus } from "@/services/common/enums/domain-enums";
import { useMutateSubmitForReview } from "@/services/domains/salons/hooks/useMutateSubmitForReview";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";

interface SalonStatusBannerProps {
  show: boolean;
  approvalStatus?: number | null;
  rejectionReason?: string | null;
  salonPublicId?: string | null;
  onToast?: (toast: { type: "success" | "error"; message: string }) => void;
}

export default function SalonStatusBanner({
  show,
  approvalStatus,
  rejectionReason,
  salonPublicId,
  onToast,
}: SalonStatusBannerProps) {
  const resubmit = useMutateSubmitForReview();

  const isRejected = approvalStatus === SalonApprovalStatus.Rejected;

  const onResubmit = async () => {
    if (!salonPublicId) return;
    try {
      await resubmit.mutateAsync(salonPublicId);
      onToast?.({
        type: "success",
        message: "سالن دوباره برای بررسی ارسال شد.",
      });
    } catch (err) {
      onToast?.({
        type: "error",
        message: getApiErrorMessage(err, "ارسال مجدد برای بررسی ناموفق بود."),
      });
    }
  };

  if (isRejected) {
    return (
      <div className="rounded-[20px] border border-critical/30 bg-critical/10 p-4">
        <p className="text-sm font-semibold text-foreground">
          سالن شما توسط ادمین رد شده است
        </p>
        <p className="mt-1 text-xs text-foreground-muted">
          {rejectionReason
            ? `دلیل رد: ${rejectionReason}`
            : "دلیل رد ثبت نشده است."}
          {" "}اطلاعات را اصلاح کنید و دوباره برای بررسی ارسال نمایید.
        </p>
        <button
          type="button"
          onClick={onResubmit}
          disabled={!salonPublicId || resubmit.isPending}
          className="mt-3 inline-flex h-9 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:opacity-50"
        >
          {resubmit.isPending ? "در حال ارسال…" : "ویرایش و ارسال مجدد"}
        </button>
      </div>
    );
  }

  if (!show) return null;

  return (
    <div className="rounded-[20px] border border-primary/30 bg-primary/10 p-4">
      <p className="text-sm font-semibold text-foreground">
        ثبت‌نام سالن ناقص است
      </p>
      <p className="mt-1 text-xs text-foreground-muted">
        برای تکمیل مراحل باقی‌مانده (خدمات، پرسنل، برنامه و ارسال بررسی) به
        ویزارد ثبت سالن بروید.
      </p>
      <Link
        href={RouteAddress.ONBOARDING.BASE}
        className="mt-3 inline-flex h-9 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground"
      >
        تکمیل ثبت‌نام سالن
      </Link>
    </div>
  );
}
