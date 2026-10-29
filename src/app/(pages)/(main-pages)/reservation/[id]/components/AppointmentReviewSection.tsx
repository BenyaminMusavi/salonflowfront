"use client";

import { useState } from "react";
import { StarIcon } from "@phosphor-icons/react";
import {
  AppointmentStatus,
  ReviewModerationStatus,
  ReviewTargetType,
} from "@/services/common/enums/domain-enums";
import {
  useMutateCreateReview,
  useMutateEditReview,
} from "@/services/domains/reviews/hooks/useMutateReviews";
import { useQueryMyReviewForAppointment } from "@/services/domains/reviews/hooks/useQueryReviewById";
import { IReview } from "@/services/domains/reviews/types/reviews.type";
import { moderationStatusLabel } from "@/services/domains/reviews/store/useMyReviewsStore";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { cn } from "@/shared/utils/className";

interface AppointmentReviewSectionProps {
  /**
   * The appointment's NUMERIC id (`numericId` of the appointment detail). `POST /api/reviews` binds a long: sending the
   * appointment Guid is a 400, so no review could ever be submitted.
   */
  appointmentId: number;
  status: number;
}

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${value} از 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          size={size}
          weight={i < value ? "fill" : "regular"}
          className={i < value ? "text-orange-400" : "text-foreground-muted"}
        />
      ))}
    </div>
  );
}

interface ReviewFormProps {
  title: string;
  hint: string;
  submitLabel: string;
  initialRating?: number;
  initialComment?: string;
  isPending: boolean;
  error: string;
  onSubmit: (rating: number, comment: string) => void;
}

function ReviewForm({ title, hint, submitLabel, initialRating = 0, initialComment = "", isPending, error, onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);

  return (
    <section className="rounded-[20px] bg-surface-tertiary p-4">
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
      <p className="mt-1 text-xs text-foreground-muted">{hint}</p>

      <div className="mt-4 flex justify-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => {
          const value = i + 1;
          return (
            <button key={value} type="button" onClick={() => setRating(value)} className="p-1" aria-label={`${value} ستاره`}>
              <StarIcon
                size={28}
                weight={value <= rating ? "fill" : "regular"}
                className={cn(value <= rating ? "text-orange-400" : "text-foreground-muted")}
              />
            </button>
          );
        })}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="نظر شما (اختیاری)"
        className="mt-4 w-full rounded-2xl bg-background-secondary px-4 py-3 text-sm text-foreground outline-none"
      />

      {error && <p className="mt-2 text-xs text-error">{error}</p>}

      <button
        type="button"
        disabled={isPending || rating < 1}
        onClick={() => onSubmit(rating, comment)}
        className="mt-3 w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-40"
      >
        {isPending ? "در حال ارسال…" : submitLabel}
      </button>
    </section>
  );
}

function ReviewSummary({ review, note }: { review: IReview; note?: string }) {
  const pending = review.moderationStatus === ReviewModerationStatus.Pending;
  return (
    <section className="rounded-[20px] bg-surface-tertiary p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-foreground">نظر شما</h3>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-semibold",
            pending ? "bg-orange-500/15 text-orange-400" : "bg-primary/15 text-primary"
          )}
        >
          {moderationStatusLabel(review.moderationStatus)}
        </span>
      </div>
      {note ? <p className="mt-2 text-xs text-foreground-muted">{note}</p> : null}
      <div className="mt-3">
        <Stars value={review.rating} />
      </div>
      {review.comment ? <p className="mt-2 text-sm text-foreground">{review.comment}</p> : null}
    </section>
  );
}

export default function AppointmentReviewSection({ appointmentId, status }: AppointmentReviewSectionProps) {
  const { data, isLoading, isError, refetch } = useQueryMyReviewForAppointment(
    status === AppointmentStatus.Completed ? appointmentId : undefined
  );
  const { mutateAsync: createReview, isPending: isCreating } = useMutateCreateReview();
  const { mutateAsync: editReview, isPending: isEditing } = useMutateEditReview();
  const [error, setError] = useState("");

  if (status !== AppointmentStatus.Completed) return null;

  if (isLoading) {
    return <p className="rounded-[20px] bg-surface-tertiary p-4 text-xs text-foreground-muted">در حال بررسی نظر شما…</p>;
  }

  // Without the server's answer we cannot know whether a review exists: do not offer a form that might duplicate it.
  if (isError) {
    return (
      <section className="rounded-[20px] bg-surface-tertiary p-4">
        <p className="text-xs text-error">وضعیت نظر شما دریافت نشد.</p>
        <button type="button" onClick={() => void refetch()} className="mt-2 text-xs font-bold text-primary">
          تلاش دوباره
        </button>
      </section>
    );
  }

  // 204 (no review yet) reaches us as an empty body.
  const review = data && typeof data === "object" ? data.data : undefined;

  if (review?.moderationStatus === ReviewModerationStatus.Pending) {
    return <ReviewSummary review={review} note="نظر شما ثبت شد و پس از تأیید مدیر پلتفرم نمایش داده می‌شود." />;
  }

  if (review?.moderationStatus === ReviewModerationStatus.Approved) {
    return <ReviewSummary review={review} />;
  }

  // Rejected: a second POST would be refused («قبلاً نظر ثبت شده»), so the customer edits the same review and resubmits it.
  if (review) {
    const handleResubmit = async (rating: number, comment: string) => {
      setError("");
      try {
        await editReview({ id: review.id, body: { rating, comment: comment.trim() || null }, appointmentId });
      } catch (e) {
        setError(getApiErrorMessage(e, "ارسال دوباره‌ی نظر ناموفق بود."));
      }
    };
    return (
      <div className="flex flex-col gap-2">
        <p className="rounded-[20px] bg-error-background px-4 py-3 text-xs text-error-foreground">
          نظر قبلی شما تأیید نشد. می‌توانید آن را اصلاح و دوباره ارسال کنید.
        </p>
        <ReviewForm
          title="ویرایش نظر"
          hint="پس از ارسال دوباره، نظر شما برای بررسی مدیر پلتفرم می‌رود."
          submitLabel="ارسال دوباره"
          initialRating={review.rating}
          initialComment={review.comment ?? ""}
          isPending={isEditing}
          error={error}
          onSubmit={(rating, comment) => void handleResubmit(rating, comment)}
        />
      </div>
    );
  }

  const handleCreate = async (rating: number, comment: string) => {
    setError("");
    if (rating < 1 || rating > 5) {
      setError("امتیاز بین 1 تا 5 را انتخاب کنید.");
      return;
    }
    try {
      await createReview({
        appointmentId,
        targetType: ReviewTargetType.Salon,
        rating,
        comment: comment.trim() || null,
      });
    } catch (e) {
      setError(getApiErrorMessage(e, "ثبت نظر ناموفق بود."));
    }
  };

  return (
    <ReviewForm
      title="ثبت نظر"
      hint="تجربه خود از این نوبت را با دیگران به اشتراک بگذارید."
      submitLabel="ارسال نظر"
      isPending={isCreating}
      error={error}
      onSubmit={(rating, comment) => void handleCreate(rating, comment)}
    />
  );
}
