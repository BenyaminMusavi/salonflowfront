"use client";

import { useState } from "react";
import { StarIcon } from "@phosphor-icons/react";
import { Button } from "@/shared/components/primitives/button/Button";
import { ReviewModerationStatus } from "@/services/common/enums/domain-enums";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { IAdminPendingReview } from "@/services/domains/reviews/types/reviews.type";
import {
  useMutateApproveReview,
  useMutateRejectReview,
  useMutateApproveReviewReply,
  useMutateRejectReviewReply,
} from "@/services/domains/reviews/hooks/useMutateAdminReviewModeration";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          size={14}
          weight={i < rating ? "fill" : "regular"}
          className={i < rating ? "text-orange-400" : "text-foreground-muted"}
        />
      ))}
    </div>
  );
}

export function ReviewModerationCard({ review }: { review: IAdminPendingReview }) {
  const [confirmRejectReview, setConfirmRejectReview] = useState(false);
  const [confirmRejectReply, setConfirmRejectReply] = useState(false);
  const [error, setError] = useState("");

  const { mutateAsync: approveReview, isPending: isApprovingReview } =
    useMutateApproveReview();
  const { mutateAsync: rejectReview, isPending: isRejectingReview } =
    useMutateRejectReview();
  const { mutateAsync: approveReply, isPending: isApprovingReply } =
    useMutateApproveReviewReply();
  const { mutateAsync: rejectReply, isPending: isRejectingReply } =
    useMutateRejectReviewReply();

  // The queue holds a review that waits for its own decision OR one that is already decided but has a reply waiting
  // (reply statuses use the same 1/2/3 values). Approving an already-approved review is an error, so offer only valid actions.
  const reviewPending = review.moderationStatus === ReviewModerationStatus.Pending;
  const replyPending = review.reply?.moderationStatus === ReviewModerationStatus.Pending;

  const run = async (action: () => Promise<unknown>, fallback: string) => {
    setError("");
    try {
      await action();
    } catch (e) {
      setError(getApiErrorMessage(e, fallback));
      setConfirmRejectReview(false);
      setConfirmRejectReply(false);
    }
  };

  return (
    <article className="rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[13px] font-bold text-foreground">{review.customerName}</p>
          <p className="mt-0.5 text-[11px] text-foreground-muted">
            {review.salonName ?? "نظر روی پرسنل"}
          </p>
        </div>
        <Stars rating={review.rating} />
      </div>

      {review.comment ? (
        <p className="mt-3 text-[13px] leading-6 text-foreground">{review.comment}</p>
      ) : null}

      {error ? (
        <p role="alert" className="mt-3 rounded-lg border border-error-border bg-error-background px-3 py-2 text-xs font-medium text-error">
          {error}
        </p>
      ) : null}

      {!reviewPending ? (
        <p className="mt-3 text-[11px] font-semibold text-foreground-muted">
          {review.moderationStatus === ReviewModerationStatus.Approved
            ? "این نظر تأیید شده است؛ فقط پاسخ سالن در انتظار بررسی است."
            : "این نظر رد شده است."}
        </p>
      ) : null}

      <div className="mt-3 flex gap-2">
        {!reviewPending ? null : confirmRejectReview ? (
          <>
            <Button
              variant="destructive"
              size="sm"
              isLoading={isRejectingReview}
              onClick={() => void run(() => rejectReview(review.id), "رد نظر ناموفق بود.")}
            >
              مطمئنم، رد کن
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={isRejectingReview}
              onClick={() => setConfirmRejectReview(false)}
            >
              انصراف
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              isLoading={isApprovingReview}
              onClick={() => void run(() => approveReview(review.id), "تأیید نظر ناموفق بود.")}
            >
              تأیید نظر
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmRejectReview(true)}
            >
              رد نظر
            </Button>
          </>
        )}
      </div>

      {review.reply ? (
        <div className="mt-3 rounded-lg border border-border bg-background-secondary p-3">
          <p className="text-[11px] font-bold text-foreground-muted">پاسخ سالن</p>
          <p className="mt-1 text-[12.5px] leading-6 text-foreground">
            {review.reply.body}
          </p>
          <div className="mt-2 flex gap-2">
            {!replyPending ? (
              <p className="text-[11px] font-semibold text-foreground-muted">
                {review.reply.moderationStatus === ReviewModerationStatus.Approved ? "پاسخ تأیید شده است." : "پاسخ رد شده است."}
              </p>
            ) : confirmRejectReply ? (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  isLoading={isRejectingReply}
                  onClick={() => void run(() => rejectReply(review.id), "رد پاسخ ناموفق بود.")}
                >
                  مطمئنم، رد کن
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isRejectingReply}
                  onClick={() => setConfirmRejectReply(false)}
                >
                  انصراف
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  isLoading={isApprovingReply}
                  onClick={() => void run(() => approveReply(review.id), "تأیید پاسخ ناموفق بود.")}
                >
                  تأیید پاسخ
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setConfirmRejectReply(true)}
                >
                  رد پاسخ
                </Button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </article>
  );
}
