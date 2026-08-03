"use client";

import { StarIcon } from "@phosphor-icons/react";
import { useQuerySalonReviews } from "@/services/domains/reviews/hooks/useQuerySalonReviews";
import { IReview } from "@/services/domains/reviews/types/reviews.type";
import { cn } from "@/shared/utils/className";

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

function ReviewCard({ review }: { review: IReview }) {
  return (
    <article className="rounded-[20px] bg-surface-tertiary p-4">
      <div className="flex items-center justify-between gap-2">
        <Stars rating={review.rating} />
        {review.isVerified && (
          <span className="text-[10px] font-semibold text-primary">
            تأییدشده
          </span>
        )}
      </div>
      {review.comment && (
        <p className="mt-2 text-sm leading-6 text-foreground">
          {review.comment}
        </p>
      )}
      {review.customerName && (
        <p className="mt-2 text-xs text-foreground-muted">
          {review.customerName}
        </p>
      )}
      {review.reply?.body && (
        <div className="mt-3 rounded-2xl bg-background-secondary px-3 py-2">
          <p className="text-[11px] font-semibold text-foreground-muted">
            پاسخ سالن
          </p>
          <p className="mt-1 text-xs leading-5 text-foreground">
            {review.reply.body}
          </p>
        </div>
      )}
    </article>
  );
}

interface SalonReviewsSectionProps {
  salonId: number | undefined;
}

export default function SalonReviewsSection({
  salonId,
}: SalonReviewsSectionProps) {
  const { data, isLoading, isError } = useQuerySalonReviews(salonId, {
    page: 1,
    pageSize: 10,
  });

  const reviews = data?.data?.items ?? [];

  return (
    <section className="mt-8 px-safe-area pb-4">
      <h2 className="mb-3 text-base font-bold text-foreground">نظرات</h2>

      {!salonId && (
        <p className="text-sm text-foreground-muted">
          شناسه عددی سالن برای بارگذاری نظرات در دسترس نیست.
        </p>
      )}

      {salonId && isLoading && (
        <p className="text-sm text-foreground-muted">در حال بارگذاری نظرات…</p>
      )}

      {salonId && isError && (
        <p className="text-sm text-error">خطا در دریافت نظرات</p>
      )}

      {salonId && !isLoading && !isError && reviews.length === 0 && (
        <p className="text-sm text-foreground-muted">هنوز نظری ثبت نشده است.</p>
      )}

      <div className={cn("flex flex-col gap-3")}>
        {reviews.map((r) => (
          <ReviewCard key={r.id} review={r} />
        ))}
      </div>
    </section>
  );
}
