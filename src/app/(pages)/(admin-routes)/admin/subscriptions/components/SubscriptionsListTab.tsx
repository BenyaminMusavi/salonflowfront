"use client";

import { useEffect, useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Input } from "@/shared/components/primitives/input/Input";
import { Badge } from "@/shared/components/primitives/badge/Badge";
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
  { value: String(SubscriptionStatus.Trialing), label: "دوره آزمایشی" },
  { value: String(SubscriptionStatus.Active), label: "فعال" },
  { value: String(SubscriptionStatus.Grace), label: "مهلت پرداخت" },
  { value: String(SubscriptionStatus.PastDue), label: "معوق" },
  { value: String(SubscriptionStatus.Canceled), label: "لغو شده" },
  { value: String(SubscriptionStatus.Expired), label: "منقضی" },
  { value: String(SubscriptionStatus.Suspended), label: "معلق" },
];

export function SubscriptionsListTab() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SubscriptionStatus | undefined>();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const { data, isLoading, isError } = useQueryAdminSubscriptions({
    page,
    pageSize: 20,
    status,
    search: search || undefined,
  });

  const result = data?.data;
  const items = result?.items ?? [];

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
      </div>

      {isError ? (
        <p className="rounded-xl border border-error-border bg-error-background px-4 py-3 text-xs font-medium text-error">
          دریافت لیست اشتراک‌ها با خطا مواجه شد.
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
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-border last:border-0">
                    <td className="px-4 py-3" colSpan={5}>
                      <div className="h-4 w-full animate-pulse rounded bg-background-secondary" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8">
                    <AdminEmptyState
                      title="اشتراکی با این فیلترها پیدا نشد"
                      description="فیلترها یا عبارت جستجو را تغییر دهید."
                    />
                  </td>
                </tr>
              ) : (
                items.map((sub, idx) => (
                  <tr
                    key={idx}
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
                      {sub.isTrial ? " (آزمایشی)" : ""}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={subscriptionStatusVariant(sub.status)}>
                        {subscriptionStatusLabel(sub.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {sub.endDate ? formatAdminDate(sub.endDate) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {result ? (
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
