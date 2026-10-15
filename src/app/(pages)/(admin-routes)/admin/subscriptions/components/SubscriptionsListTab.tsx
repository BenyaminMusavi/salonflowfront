"use client";

import { useEffect, useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Input } from "@/shared/components/primitives/input/Input";
import { Badge } from "@/shared/components/primitives/badge/Badge";
import { Button } from "@/shared/components/primitives/button/Button";
import { cn } from "@/shared/utils/className";
import { useMutateApproveResume, useMutateRejectResume } from "@/services/domains/subscriptions/hooks/useMutateSubscriptions";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { useQueryAdminSubscriptions } from "@/services/domains/admin/hooks/useQueryAdminSubscriptions";
import { SubscriptionStatus } from "@/services/common/enums/domain-enums";
import {
  subscriptionStatusLabel,
  subscriptionStatusVariant,
} from "@/services/domains/subscriptions/utils/subscription-display";
import { formatAdminDate } from "@/services/domains/admin/utils/admin-salon-display";
import { AdminPagination } from "../../_components/AdminPagination";
import { AdminEmptyState } from "../../_components/AdminEmptyState";
import { AdminSelectFilter } from "../../_components/AdminSelectFilter";

const STATUS_FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "همهٔ وضعیت‌ها" },
  { value: String(SubscriptionStatus.Active), label: "فعال" },
  { value: String(SubscriptionStatus.PendingStart), label: "در انتظار شروع" },
  { value: String(SubscriptionStatus.Grace), label: "مهلت پرداخت" },
  { value: String(SubscriptionStatus.Canceled), label: "لغو شده" },
  { value: String(SubscriptionStatus.Expired), label: "منقضی" },
  { value: String(SubscriptionStatus.Suspended), label: "معلق" },
];

/** The API has no filter for resume requests, so this view reads a bigger page and filters here. */
const RESUME_PAGE_SIZE = 100;

export function SubscriptionsListTab({ initialResumeOnly = false }: { initialResumeOnly?: boolean }) {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SubscriptionStatus | undefined>();
  const [resumeOnly, setResumeOnly] = useState(initialResumeOnly);
  const [approveError, setApproveError] = useState("");
  const { mutateAsync: approveResume, isPending: approving, variables: approvingId } =
    useMutateApproveResume();
  const { mutateAsync: rejectResume, isPending: rejecting, variables: rejectingId } =
    useMutateRejectResume();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const { data, isLoading, isError } = useQueryAdminSubscriptions({
    page: resumeOnly ? 1 : page,
    pageSize: resumeOnly ? RESUME_PAGE_SIZE : 20,
    status,
    search: search || undefined,
  });

  const result = data?.data;
  const items = (result?.items ?? []).filter((sub) => !resumeOnly || !!sub.resumeRequestedAt);

  const onApprove = async (publicId: string) => {
    setApproveError("");
    try {
      await approveResume(publicId);
    } catch (e) {
      setApproveError(getApiErrorMessage(e, "تأیید برگرداندن لغو ناموفق بود."));
    }
  };

  const onReject = async (publicId: string) => {
    setApproveError("");
    try {
      await rejectResume(publicId);
    } catch (e) {
      setApproveError(getApiErrorMessage(e, "رد درخواست ناموفق بود."));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="max-w-sm flex-1">
          <Input
            startIcon={<MagnifyingGlassIcon size={18} />}
            placeholder="جستجو بر اساس نام یا شماره مالک…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <AdminSelectFilter
          value={status != null ? String(status) : ""}
          onChange={(e) => {
            setStatus(e.target.value ? Number(e.target.value) : undefined);
            setPage(1);
          }}
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </AdminSelectFilter>
        <button
          type="button"
          onClick={() => setResumeOnly((v) => !v)}
          className={cn(
            "rounded-lg border px-3 py-2 text-xs font-semibold transition-colors",
            resumeOnly
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-surface text-foreground-muted hover:text-foreground"
          )}
        >
          درخواست‌های برگرداندن لغو
        </button>
      </div>

      {isError || approveError ? (
        <p className="rounded-xl border border-error-border bg-error-background px-4 py-3 text-xs font-medium text-error">
          {approveError || "دریافت لیست اشتراک‌ها با خطا مواجه شد."}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-right text-[13px]">
            <thead>
              <tr className="border-b border-border bg-background-secondary text-[11px] text-foreground-muted">
                <th className="px-4 py-3 font-semibold">مالک</th>
                <th className="px-4 py-3 font-semibold">سالن</th>
                <th className="px-4 py-3 font-semibold">پلن</th>
                <th className="px-4 py-3 font-semibold">وضعیت</th>
                <th className="px-4 py-3 font-semibold">پایان دوره</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-border last:border-0">
                    <td className="px-4 py-3" colSpan={6}>
                      <div className="h-4 w-full animate-pulse rounded bg-background-secondary" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8">
                    <AdminEmptyState
                      title={resumeOnly ? "درخواستی برای برگرداندن لغو نیست" : "اشتراکی با این فیلترها پیدا نشد"}
                      description="فیلترها یا عبارت جستجو را تغییر دهید."
                    />
                  </td>
                </tr>
              ) : (
                items.map((sub) => (
                  <tr
                    key={sub.publicId}
                    className="border-b border-border text-foreground last:border-0 hover:bg-background-secondary"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">{sub.ownerName}</p>
                      <p className="text-[11px] text-foreground-muted" dir="ltr">
                        {sub.ownerPhone}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {sub.salonName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {sub.planName}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={subscriptionStatusVariant(sub.status)}>
                          {subscriptionStatusLabel(sub.status)}
                        </Badge>
                        {sub.cancelAtPeriodEnd ? <Badge variant="warning">لغو در پایان دوره</Badge> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {sub.endDate ? formatAdminDate(sub.endDate) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {sub.resumeRequestedAt ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            isLoading={approving && approvingId === sub.publicId}
                            disabled={rejecting}
                            onClick={() => void onApprove(sub.publicId)}
                          >
                            تأیید برگرداندن لغو
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            isLoading={rejecting && rejectingId === sub.publicId}
                            disabled={approving}
                            onClick={() => void onReject(sub.publicId)}
                          >
                            رد درخواست
                          </Button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {result && !resumeOnly ? (
          <AdminPagination
            page={result.page}
            totalPages={result.totalPages}
            hasNext={result.hasNext}
            hasPrevious={result.hasPrevious}
            onPageChange={setPage}
          />
        ) : null}
      </div>
    </div>
  );
}
