"use client";

import { useState } from "react";
import { StarIcon } from "@phosphor-icons/react";
import { Button } from "@/shared/components/primitives/button/Button";
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

  const { mutateAsync: approveReview, isPending: isApprovingReview } =
    useMutateApproveReview();
  const { mutateAsync: rejectReview, isPending: isRejectingReview } =
    useMutateRejectReview();
  const { mutateAsync: approveReply, isPending: isApprovingReply } =
    useMutateApproveReviewReply();
  const { mutateAsync: rejectReply, isPending: isRejectingReply } =
    useMutateRejectReviewReply();

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

      <div className="mt-3 flex gap-2">
        {confirmRejectReview ? (
          <>
            <Button
              variant="destructive"
              size="sm"
              isLoading={isRejectingReview}
              onClick={() => rejectReview(review.id)}
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
              onClick={() => approveReview(review.id)}
            >
              تایید نظر
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
            {confirmRejectReply ? (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  isLoading={isRejectingReply}
                  onClick={() => rejectReply(review.id)}
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
                  onClick={() => approveReply(review.id)}
                >
                  تایید پاسخ
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
