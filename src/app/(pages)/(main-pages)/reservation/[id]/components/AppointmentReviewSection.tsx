"use client";

import { useEffect, useState } from "react";
import { StarIcon } from "@phosphor-icons/react";
import { AppointmentStatus } from "@/services/common/enums/domain-enums";
import { ReviewModerationStatus } from "@/services/common/enums/domain-enums";
import { ReviewTargetType } from "@/services/common/enums/domain-enums";
import { useMutateCreateReview } from "@/services/domains/reviews/hooks/useMutateReviews";
import { useQueryReviewById } from "@/services/domains/reviews/hooks/useQueryReviewById";
import {
  moderationStatusLabel,
  useMyReviewsStore,
} from "@/services/domains/reviews/store/useMyReviewsStore";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { cn } from "@/shared/utils/className";

interface AppointmentReviewSectionProps {
  appointmentId: number;
  status: number;
}

export default function AppointmentReviewSection({
  appointmentId,
  status,
}: AppointmentReviewSectionProps) {
  const stored = useMyReviewsStore((s) => s.getForAppointment(appointmentId));
  const setForAppointment = useMyReviewsStore((s) => s.setForAppointment);

  const { data: reviewRes } = useQueryReviewById(stored?.reviewId);
  const { mutateAsync: createReview, isPending } = useMutateCreateReview();

  const [rating, setRating] = useState(stored?.rating ?? 0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    const remote = reviewRes?.data;
    if (remote && stored) {
      setForAppointment(appointmentId, {
        reviewId: remote.id,
        moderationStatus: remote.moderationStatus,
        rating: remote.rating,
      });
      setRating(remote.rating);
      if (remote.comment) setComment(remote.comment);
    }
  }, [reviewRes?.data, appointmentId, setForAppointment, stored]);

  if (status !== AppointmentStatus.Completed) return null;

  const moderationStatus =
    reviewRes?.data?.moderationStatus ?? stored?.moderationStatus;
  const hasReview = typeof stored?.reviewId === "number" || justSubmitted;

  if (hasReview && moderationStatus === ReviewModerationStatus.Pending) {
    return (
      <section className="rounded-[20px] bg-surface-tertiary p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-foreground">نظر شما</h3>
          <span className="rounded-full bg-orange-500/15 px-2.5 py-1 text-[11px] font-semibold text-orange-400">
            {moderationStatusLabel(ReviewModerationStatus.Pending)}
          </span>
        </div>
        <p className="mt-2 text-xs text-foreground-muted">
          نظر شما ثبت شد و پس از تأیید مدیر پلتفرم نمایش داده می‌شود.
        </p>
        {rating > 0 && (
          <div className="mt-3 flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon
                key={i}
                size={16}
                weight={i < rating ? "fill" : "regular"}
                className={i < rating ? "text-orange-400" : "text-foreground-muted"}
              />
            ))}
          </div>
        )}
      </section>
    );
  }

  if (hasReview && moderationStatus === ReviewModerationStatus.Approved) {
    return (
      <section className="rounded-[20px] bg-surface-tertiary p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-foreground">نظر شما</h3>
          <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary">
            {moderationStatusLabel(ReviewModerationStatus.Approved)}
          </span>
        </div>
        <div className="mt-3 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon
              key={i}
              size={16}
              weight={i < (reviewRes?.data?.rating ?? rating) ? "fill" : "regular"}
              className={
                i < (reviewRes?.data?.rating ?? rating)
                  ? "text-orange-400"
                  : "text-foreground-muted"
              }
            />
          ))}
        </div>
        {(reviewRes?.data?.comment || comment) && (
          <p className="mt-2 text-sm text-foreground">
            {reviewRes?.data?.comment || comment}
          </p>
        )}
      </section>
    );
  }

  // Pending already handled; Rejected / missing → show create form
  const handleSubmit = async () => {
    setError("");
    if (rating < 1 || rating > 5) {
      setError("امتیاز بین ۱ تا ۵ را انتخاب کنید.");
      return;
    }
    try {
      await createReview({
        appointmentId,
        targetType: ReviewTargetType.Salon,
        rating,
        comment: comment.trim() || null,
      });
      setJustSubmitted(true);
    } catch (e) {
      setError(getApiErrorMessage(e, "ثبت نظر ناموفق بود."));
    }
  };

  return (
    <section className="rounded-[20px] bg-surface-tertiary p-4">
      <h3 className="text-sm font-bold text-foreground">ثبت نظر</h3>
      <p className="mt-1 text-xs text-foreground-muted">
        تجربه خود از این نوبت را با دیگران به اشتراک بگذارید.
      </p>

      <div className="mt-4 flex justify-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => {
          const value = i + 1;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className="p-1"
              aria-label={`${value} ستاره`}
            >
              <StarIcon
                size={28}
                weight={value <= rating ? "fill" : "regular"}
                className={cn(
                  value <= rating ? "text-orange-400" : "text-foreground-muted"
                )}
              />
            </button>
          );
        })}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="نظر شما (اختیاری)"
        className="mt-4 w-full rounded-2xl bg-background-secondary px-4 py-3 text-sm text-foreground outline-none"
      />

      {error && (
        <p className="mt-2 text-xs text-error">{error}</p>
      )}

      <button
        type="button"
        disabled={isPending || rating < 1}
        onClick={handleSubmit}
        className="mt-3 w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-40"
      >
        {isPending ? "در حال ارسال…" : "ارسال نظر"}
      </button>
    </section>
  );
}
