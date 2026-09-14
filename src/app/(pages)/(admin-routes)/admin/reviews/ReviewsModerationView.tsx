"use client";

import { useState } from "react";
import { useQueryAdminPendingReviews } from "@/services/domains/reviews/hooks/useQueryAdminPendingReviews";
import { AdminPagination } from "../_components/AdminPagination";
import { AdminEmptyState } from "../_components/AdminEmptyState";
import { ReviewModerationCard } from "./components/ReviewModerationCard";

export default function ReviewsModerationView() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useQueryAdminPendingReviews({ page, pageSize: 20 });

  const result = data?.data;
  const items = result?.items ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-lg font-bold text-foreground">تایید نظرات و پاسخ سالن‌ها</h1>
        <p className="mt-1 text-xs text-foreground-muted">
          نظرات مشتریان و پاسخ سالن‌ها به آن‌ها که در انتظار بررسی هستند.
        </p>
      </div>

      {isError ? (
        <p className="rounded-xl border border-error-border bg-error-background px-4 py-3 text-xs font-medium text-error">
          دریافت لیست نظرات با خطا مواجه شد.
        </p>
      ) : null}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="h-28 animate-pulse rounded-xl border border-border bg-surface"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <AdminEmptyState
          title="نظر در انتظار تاییدی وجود ندارد"
          description="همهٔ نظرات و پاسخ‌ها بررسی شده‌اند."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((review) => (
            <ReviewModerationCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {result && result.totalPages > 1 ? (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <AdminPagination
            page={result.page}
            totalPages={result.totalPages}
            hasNext={result.hasNext}
            hasPrevious={result.hasPrevious}
            onPageChange={setPage}
          />
        </div>
      ) : null}
    </div>
  );
}
